<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\CreateRequest;
use App\Http\Requests\Purchase\UpdateRequest as PurchaseUpdateRequest;
use App\Http\Resources\PurchaseResource;
use App\Http\Resources\SupplierPaymentResource;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\Purchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Carbon;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {

            $baseQuery = Purchase::with([
                'Supplier',
                'PurchaseItem',
                'PurchaseItem.Product',
                'PurchaseItem.ProductUnit'
            ]);

            $baseQuery->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
            $baseQuery->when($request->filled('start_date') && $request->filled('end_date'), function ($q) use ($request) {
                $q->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
            });

            $baseQuery->when($request->filled('batch_status'), function ($q) use ($request) {
                match ($request->batch_status) {

                    'available' => $q->whereHas('PurchaseItem', function ($subQuery) {
                        $subQuery->where('remaining_qty', '>', 0);
                    }),
                    'out-of-stock' => $q->whereHas('PurchaseItem', function ($subQuery) {
                        $subQuery->where('remaining_qty', '<=', 0);
                    }),
                    default => $q
                };
            });

            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();

            $totalMonthlyPurchase = $baseQuery->clone()
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->count();

            $totalMonthlyPaidPurchase = $baseQuery->clone()
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->where('status', 'paid')
                ->count();

            $totalPendingPurchase = $baseQuery->clone()
                ->where('status', 'unpaid')
                ->count();

            $totalRemainingBill = $baseQuery->clone()
                ->sum('remaining_bill');

            $data = $baseQuery->latest()->paginate(10);
            // $data = $baseQuery->whereBetween('transaction_date', [$startDate, $endDate])->latest()->paginate(10);

            return response()->json([
                'status'  => true,
                'message' => 'Fetch Purchases Successful',
                'data'    => PurchaseResource::collection($data)->additional([
                    'meta' => [
                        'stats' => [
                            'total_monthly_purchase'      => $totalMonthlyPurchase,
                            'total_pending_purchase'      => $totalPendingPurchase,
                            'total_monthly_paid_purchase' => $totalMonthlyPaidPurchase,
                            'total_remaining_bill'        => (float) $totalRemainingBill,
                        ]
                    ]
                ])->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getOptions(): JsonResponse
    {
        try {
            $data = Purchase::with([
                'Supplier',
                'PurchaseItem',
                'PurchaseItem.Product',
                'PurchaseItem.ProductUnit'
            ])->latest()->get();
            return response()->json([
                'status' => true,
                'message' => 'Fetch Purchases Successful',
                'data' => PurchaseResource::collection($data),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateRequest $request)
    {
        $purchase = DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $prefix = "ORD/" . date('dmY') . "/";
            do {
                $randomSuffix = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

                $invoiceNumber = $prefix . $randomSuffix;
                $exists = Purchase::where('invoice_number', $invoiceNumber)->exists();
            } while ($exists);
            $purchase = Purchase::create([
                'invoice_number'   => $invoiceNumber,
                'supplier_id'      => $validated['supplier_id'],
                'transaction_date' => $validated['transaction_date'],
                'total_amount'     => 0,
                'remaining_bill'   => 0,
                'status'           => $validated['status']
            ]);

            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $productUnit = ProductUnit::findOrFail($item['product_unit_id']);
                $calculatedStock = $item['quantity'] * $productUnit->conversion_factor;
                $subtotalItem = $item['quantity'] * $item['price'];
                $totalAmount += $subtotalItem;

                $costPricePerUnit = $item['price'] / $productUnit->conversion_factor;

                $purchase->PurchaseItem()->create([
                    'product_id'      => $item['product_id'],
                    'product_unit_id' => $item['product_unit_id'],
                    'quantity'        => $item['quantity'],
                    'price'           => $costPricePerUnit,
                    'remaining_qty'   => $calculatedStock,
                    'subtotal'        => $subtotalItem,
                ]);
                $product = Product::findOrFail($productUnit->product_id);
                $product->update([
                    'stock' => $product->stock + $calculatedStock,
                ]);
            }
            $remainingBill = $validated['status'] === 'paid' ? 0 : $totalAmount;
            $purchase->update([
                'total_amount'   => $totalAmount,
                'remaining_bill' => $remainingBill,
            ]);
            if ($validated['status'] === 'paid') {
                $supplier = $purchase->Supplier;
                $payment = $supplier->SupplierPayment()->create([
                    'purchase_id'  => $purchase->id,
                    'amount'       => $totalAmount,
                    'payment_date' => $validated['transaction_date'],
                    'notes'        => $request->notes ?? null,
                ]);
                $payment->Expense()->create([
                    'type'         => 'pay_supplier',
                    'amount'       => $totalAmount,
                    'expense_date' => $validated['transaction_date'],
                    'notes'        => $request->notes ?? null,
                    'attendance_id' => null,
                    'supplier_payment_id' => $payment->id

                ]);
            }
            return $purchase;
        });

        if ($purchase) {
            $purchase->load(['Supplier', 'PurchaseItem.Product', 'PurchaseItem.ProductUnit', 'Supplier.SupplierPayment.Expense']);

            return response()->json([
                'status'  => true,
                'message' => 'Purchase Created Successfully',
                'data'    => new PurchaseResource($purchase),
            ], 201);
        }

        return response()->json([
            'status'  => false,
            'message' => 'Internal Server Error',
        ], 500);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {

            $purchase = Purchase::with([
                'Supplier',
                'PurchaseItem.Product',
                'PurchaseItem.ProductUnit'
            ])->findOrFail($id);
            return response()->json([
                'status'  => true,
                'message' => 'Fetch Purchase Successful',
                'data'    => new PurchaseResource($purchase),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Purchase Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('purchase show error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PurchaseUpdateRequest $request, string $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $validated = $request->validated();
            $purchase = Purchase::with('purchaseItem.product')->findOrFail($id);
            if ($purchase->status === 'paid') {
                return response()->json([
                    'status'  => false,
                    'message' => 'Nota yang sudah lunas tidak dapat diedit kembali. Silakan lakukan retur atau buat nota baru.'
                ], 422);
            }

            $totalMoneyPaidBefore = (float)$purchase->total_amount - (float)$purchase->remaining_bill;

            foreach ($purchase->purchaseItem as $oldItem) {
                $productUnit = ProductUnit::findOrFail($oldItem->product_unit_id);
                $oldCalculatedStock = $oldItem->quantity * $productUnit->conversion_factor;

                if ((float)$oldItem->remaining_qty !== (float)$oldCalculatedStock) {
                    return response()->json([
                        'status'  => false,
                        'message' => "Gagal update! Produk '{$oldItem->product?->name}' pada nota ini sudah digunakan dalam transaksi penjualan."
                    ], 422);
                }
            }


            foreach ($purchase->purchaseItem as $oldItem) {
                $productUnit = ProductUnit::findOrFail($oldItem->product_unit_id);
                $oldCalculatedStock = $oldItem->quantity * $productUnit->conversion_factor;

                $product = $oldItem->product;
                if ($product) {
                    $product->update([
                        'stock' => $product->stock - $oldCalculatedStock
                    ]);
                }
            }

            $purchase->purchaseItem()->delete();

            $newTotalAmount = 0;

            foreach ($validated['items'] as $item) {
                $productUnit = ProductUnit::findOrFail($item['product_unit_id']);
                $calculatedStock = $item['quantity'] * $productUnit->conversion_factor;
                $subtotalItem = $item['quantity'] * $item['price'];
                $newTotalAmount += $subtotalItem;

                $costPricePerUnit = $item['price'] / $productUnit->conversion_factor;

                $purchase->purchaseItem()->create([
                    'product_id'      => $item['product_id'],
                    'product_unit_id' => $item['product_unit_id'],
                    'quantity'        => $item['quantity'],
                    'price'           => $costPricePerUnit,
                    'remaining_qty'   => $calculatedStock,
                    'subtotal'        => $subtotalItem,
                ]);

                $product = Product::findOrFail($item['product_id']);
                $product->update([
                    'stock' => $product->stock + $calculatedStock
                ]);
            }

            if ($totalMoneyPaidBefore >= $newTotalAmount) {
                $newRemainingBill = 0;
                $newStatus = 'paid';
            } else {
                $newRemainingBill = $newTotalAmount - $totalMoneyPaidBefore;
                $newStatus = 'unpaid';
            }

            $purchase->update([
                'supplier_id'      => $validated['supplier_id'],
                'transaction_date' => $validated['transaction_date'],
                'total_amount'     => $newTotalAmount,
                'remaining_bill'   => $newRemainingBill,
                'status'           => $newStatus
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Purchase Updated Successfully',
                'data'    => new PurchaseResource($purchase->load('purchaseItem.product')),
            ], 200);
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $purchase = Purchase::with(['PurchaseItem'])->findOrFail($id);

            foreach ($purchase->PurchaseItem as $item) {
                $initialStock = $item->quantity * $item->ProductUnit->conversion_factor;

                if ((float) $item->remaining_qty < $initialStock) {
                    return response()->json([
                        'status'  => false,
                        'message' => "Gagal menghapus! Produk '{$item->Product->name}' dari nota ini sudah sebagian terjual ke pelanggan."
                    ], 422);
                }
            }

            if ($purchase->status === 'unpaid' && (float)$purchase->remaining_bill !== (float)$purchase->total_amount) {
                return response()->json([
                    'status'  => false,
                    'message' => "Gagal menghapus! Nota ini memiliki riwayat pembayaran cicilan aktif."
                ], 422);
            }
            DB::transaction(function () use ($purchase) {
                foreach ($purchase->PurchaseItem as $item) {
                    $product = $item->Product;
                    $product->update([
                        'stock' => $product->stock - $item->remaining_qty
                    ]);
                }
                if ($purchase->status === 'paid') {
                    $supplierPayments = $purchase->Supplier->SupplierPayment()->where('purchase_id', $purchase->id)->get();

                    foreach ($supplierPayments as $payment) {
                        $payment->Expense()->delete();
                        $payment->delete();
                    }
                }
                $purchase->PurchaseItem()->delete();
                $purchase->delete();
            });

            return response()->json([
                'status'  => true,
                'message' => 'Purchase and its financial tracks deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Purchase destroy error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
