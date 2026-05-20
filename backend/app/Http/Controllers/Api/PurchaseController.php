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

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Purchase::with('Supplier', 'PurchaseItem', 'PurchaseItem.Product', 'PurchaseItem.ProductUnit')->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Purchases Successful',
                'data' => PurchaseResource::collection($data)->response()->getData(true),
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
            $invoiceNumber = "ORD/" . date('dmY') . "/" . str_pad(Purchase::count() + 1, 4, '0', STR_PAD_LEFT);
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

            foreach ($purchase->purchaseItem as $oldItem) {
                $productUnit = ProductUnit::findOrFail($oldItem->product_unit_id);
                $oldCalculatedStock = $oldItem->quantity * $productUnit->conversion_factor;

                if ($oldItem->remaining_qty !== $oldCalculatedStock) {
                    return response()->json([
                        'status'  => false,
                        'message' => "Gagal update! Stok dari produk '{$oldItem->product?->name}' pada nota ini sudah ada yang terjual."
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

            $totalAmount = 0;

            foreach ($validated['items'] as $item) {
                $productUnit = ProductUnit::findOrFail($item['product_unit_id']);
                $calculatedStock = $item['quantity'] * $productUnit->conversion_factor;
                $subtotalItem = $item['quantity'] * $item['price'];
                $totalAmount += $subtotalItem;

                $costPricePerUnit = $item['price'] / $productUnit->conversion_factor;

                $purchase->purchaseItem()->create([
                    'product_id'      => $item['product_id'],
                    'product_unit_id' => $item['product_unit_id'],
                    'quantity'        => $item['quantity'],
                    'price'           => $costPricePerUnit,
                    'remaining_qty'   => $calculatedStock,
                    'subtotal'        => $subtotalItem,
                ]);

                $product = Product::findOrFail($productUnit->product_id);
                $product->update([
                    'stock' => $product->stock + $calculatedStock
                ]);
            }

            $purchase->update([
                'supplier_id'      => $validated['supplier_id'],
                'transaction_date' => $validated['transaction_date'],
                'total_amount'     => $totalAmount,
                'remaining_bill'   => $totalAmount,
                'status'   => 'unpaid'
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
    public function destroy(string $id)
    {
        DB::transaction(function () use ($id) {
            try {
                $purchase = Purchase::findOrFail($id);
                $purchase->delete();
                return response()->json([
                    'status' => true,
                    'message' => 'Purchase Deleted Successfully',
                ], 200);
            } catch (ModelNotFoundException $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Purchase Not Found',
                ], 404);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Internal Server Error' . $e->getMessage(),
                ], 500);
            }
        });
    }
}
