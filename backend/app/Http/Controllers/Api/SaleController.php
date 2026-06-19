<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Sale;
use App\Http\Resources\SaleResource;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Sale\CreateRequest as SaleCreate;
use App\Http\Requests\Sale\UpdateRequest as SaleUpdate;
use App\Models\ProductUnit;
use App\Models\PurchaseItem;
use App\Models\Product;
use App\Models\SaleItem;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Sale::with('Customer', 'SaleItem', 'SaleItem.Product', 'SaleItem.ProductUnit');
            $query->when($request->filled('start_date') && $request->filled('end_date'), function ($q) use ($request) {
                $q->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
            });
            $query->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
            $data = (clone $query)->latest()->paginate(10);

            $statsQuery = Sale::query();

            $totalPendingSale = (clone $statsQuery)->where('status', 'unpaid')->count();
            $totalRemainingBill = (clone $statsQuery)->where('status', 'unpaid')->sum('remaining_bill');

            $thisMonthStart = Carbon::now()->startOfMonth()->toDateString();
            $thisMonthEnd = Carbon::now()->endOfMonth()->toDateString();
            $monthlyQuery = (clone $statsQuery)->whereBetween('transaction_date', [$thisMonthStart, $thisMonthEnd]);

            $totalMonthlySale = (clone $monthlyQuery)->count();
            $totalMonthlyPaidSale = $monthlyQuery->where('status', 'paid')->count();
            return response()->json([
                'status' => true,
                'message' => 'Fetch Sales Successful',
                'data' => SaleResource::collection($data)->additional([
                    'meta' => [
                        'stats' => [
                            'total_monthly_sale' => $totalMonthlySale,
                            'total_monthly_paid_sale' => $totalMonthlyPaidSale,
                            'total_pending_sale' => $totalPendingSale,
                            'total_remaining_bill' => (float) $totalRemainingBill,
                        ]
                    ]
                ])->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('sale index error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getOptions(): JsonResponse
    {
        try {
            $data = Sale::with('Customer', 'SaleItem', 'SaleItem.Product', 'SaleItem.ProductUnit')->latest()->get();
            return response()->json([
                'status' => true,
                'message' => 'Fetch Sales Successful',
                'data' => SaleResource::collection($data),
            ], 200);
        } catch (\Exception $e) {
            Log::error('sale options error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaleCreate $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $sale = DB::transaction(function () use ($validated) {
                $prefix = "ORD/" . date('dmY') . "/";
                do {
                    $randomSuffix = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

                    $invoiceNumber = $prefix . $randomSuffix;
                    $exists = Sale::where('invoice_number', $invoiceNumber)->exists();
                } while ($exists);
                $status = "unpaid";

                $sale = Sale::create([
                    'invoice_number'   => $invoiceNumber,
                    'customer_id'      => $validated['customer_id'],
                    'transaction_date' => $validated['transaction_date'],
                    'total_amount'     => 0,
                    'remaining_bill'   => 0,
                    'status'           => $status
                ]);

                $totalAmount = 0;


                foreach ($validated['items'] as $item) {
                    $productUnit = ProductUnit::findOrFail($item['product_unit_id']);
                    $qtyNeededInBaseUnit = $item['quantity'] * $productUnit->conversion_factor;

                    // if ($item['discount_amount'] > 0) {
                    //     $subtotalItem = $item['quantity'] * $item['discount_amount'];
                    //     $totalAmount += $subtotalItem;
                    // } else {
                    //     $subtotalItem = $item['quantity'] * $productUnit->price;
                    //     $totalAmount += $subtotalItem;
                    // }


                    $product = Product::findOrFail($item['product_id']);

                    $tempQtyNeeded = $qtyNeededInBaseUnit;
                    $totalCostForThisItem = 0;

                    $batches = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $item['product_id'])
                        ->where('purchase_items.remaining_qty', '>', 0)
                        ->orderBy('purchases.transaction_date', 'asc')
                        ->orderBy('purchase_items.created_at', 'asc')
                        ->select('purchase_items.*')
                        ->get();
                    $lastPurchasePrice = 0;

                    foreach ($batches as $batch) {
                        if ($tempQtyNeeded <= 0) break;
                        $takeFromThisBatch = min($batch->remaining_qty, $tempQtyNeeded);
                        $totalCostForThisItem += $takeFromThisBatch * $batch->price;
                        $lastPurchasePrice = $batch->price;

                        $batch->update([
                            'remaining_qty' => $batch->remaining_qty - $takeFromThisBatch
                        ]);
                        $tempQtyNeeded -= $takeFromThisBatch;
                    }
                    if ($tempQtyNeeded > 0) {
                        if ($lastPurchasePrice == 0) {
                            $lastPurchasePrice = $product->cost_price ?? 0;
                        }
                        $totalCostForThisItem += $tempQtyNeeded * $lastPurchasePrice;
                        $tempQtyNeeded = 0;
                    }

                    $costPriceAtSale = $totalCostForThisItem / $qtyNeededInBaseUnit;

                    if ($item['discount_amount'] > 0) {
                        $subtotalItem = $item['quantity'] * $item['discount_amount'];
                        $totalAmount += $subtotalItem;
                        $sale->SaleItem()->create([
                            'product_id'         => $item['product_id'],
                            'product_unit_id'    => $item['product_unit_id'],
                            'quantity'           => $item['quantity'],
                            'price'              => $item['discount_amount'],
                            'cost_price_at_sale' => $costPriceAtSale,
                            'subtotal'           => $subtotalItem
                        ]);
                    } else {
                        $subtotalItem = $item['quantity'] * $productUnit->price;
                        $totalAmount += $subtotalItem;
                        $sale->SaleItem()->create([
                            'product_id'         => $item['product_id'],
                            'product_unit_id'    => $item['product_unit_id'],
                            'quantity'           => $item['quantity'],
                            'price'              => $productUnit->price,
                            'cost_price_at_sale' => $costPriceAtSale,
                            'subtotal'           => $subtotalItem
                        ]);
                    }

                    $product->update([
                        'stock' => $product->stock - $qtyNeededInBaseUnit
                    ]);
                }

                $sale->update([
                    'total_amount'   => $totalAmount,
                    'remaining_bill' => $totalAmount,
                ]);

                return $sale;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Sale Created Successfully',
                'data'    => $sale->load('SaleItem'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('sale store error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function triggerBackfill(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'nullable|exists:products,id'

        ]);
        DB::transaction(function () use ($request) {
            if ($request->product_id) {
                $this->backfillCostPriceAtSale($request->product_id);
            } else {
                $productIds = SaleItem::where('cost_price_at_sale', '<=', 0)
                    ->distinct()
                    ->pluck('product_id');

                foreach ($productIds as $id) {
                    $this->backfillCostPriceAtSale($id);
                }
            }
        });
        return response()->json([
            'status' => true,
            'message' => 'HPP Berhasil disinkronkan dengan batch terbaru.'
        ]);
    }


    private function backfillCostPriceAtSale(string $productId)
    {
        $brokenSaleItems = SaleItem::with('ProductUnit')->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sale_items.product_id', $productId)
            ->where(function ($query) {
                $query->where('sale_items.cost_price_at_sale', '<=', 0)
                    ->orWhereNull('sale_items.cost_price_at_sale');
            })
            ->orderBy('sales.transaction_date', 'asc')
            ->orderBy('sale_items.created_at', 'asc')
            ->select('sale_items.*')
            ->get();

        if ($brokenSaleItems->isEmpty()) return;

        foreach ($brokenSaleItems as $saleItem) {
            $qtyNeeded = $saleItem->quantity * $saleItem->ProductUnit->conversion_factor;
            $availableBatches = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                ->where('purchase_items.product_id', $productId)
                ->where('purchase_items.remaining_qty', '>', 0)
                ->orderBy('purchases.transaction_date', 'asc')
                ->orderBy('purchase_items.created_at', 'asc')
                ->select('purchase_items.*')
                ->get();

            if ($availableBatches->isEmpty()) break;

            $tempQtyNeeded = $qtyNeeded;
            $totalCostForThisItem = 0;

            foreach ($availableBatches as $batch) {
                if ($tempQtyNeeded <= 0) break;

                $takeFromThisBatch = min($batch->remaining_qty, $tempQtyNeeded);
                $totalCostForThisItem += $takeFromThisBatch * $batch->price;
                $batch->update([
                    'remaining_qty' => $batch->remaining_qty - $takeFromThisBatch
                ]);

                $tempQtyNeeded -= $takeFromThisBatch;
            }
            if ($tempQtyNeeded < $qtyNeeded) {
                $actualQtyFulfilled = $qtyNeeded - $tempQtyNeeded;
                $newCostPrice = $totalCostForThisItem / $actualQtyFulfilled;

                $saleItem->update([
                    'cost_price_at_sale' => $newCostPrice
                ]);
            }
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $sale = Sale::with([
                'Customer.CustomerPayment',
                'SaleItem.Product',
                'SaleItem.ProductUnit'
            ])->findOrFail($id);
            $invoiceNumber = $sale->invoice_number;
            return response()->json([
                'status'  => true,
                'message' => 'Sale : ' . $invoiceNumber . ' Fetched Successfully',
                'data'    => new SaleResource($sale),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Sale Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('sale show error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(SaleUpdate $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            $sale = DB::transaction(function () use ($validated, $id) {
                $sale = Sale::with(['SaleItem.ProductUnit', 'SaleItem.Product'])->findOrFail($id);

                if ($sale->status === 'paid') {
                    throw ValidationException::withMessages([
                        'status' => 'Nota penjualan yang sudah lunas tidak dapat diedit kembali. Silakan lakukan retur.'
                    ]);
                }

                $totalMoneyPaidBefore = (float)$sale->total_amount - (float)$sale->remaining_bill;

                foreach ($sale->saleItem as $oldItem) {
                    $oldProductUnit = $oldItem->productUnit;
                    $oldQtyInBaseUnit = $oldItem->quantity * $oldProductUnit->conversion_factor;

                    $product = $oldItem->Product;
                    $product->update([
                        'stock' => $product->stock + $oldQtyInBaseUnit
                    ]);

                    $tempReversalQty = $oldQtyInBaseUnit;
                    $batchesToRestore = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $oldItem->product_id)
                        ->orderBy('purchases.transaction_date', 'desc')
                        ->orderBy('purchase_items.created_at', 'desc')
                        ->select('purchase_items.*')
                        ->get();

                    foreach ($batchesToRestore as $batch) {
                        if ($tempReversalQty <= 0) break;

                        $maxBatchCapacity = $batch->quantity * $batch->ProductUnit->conversion_factor;
                        $availableSpace = $maxBatchCapacity - $batch->remaining_qty;

                        if ($availableSpace > 0) {
                            $restoreAmount = min($availableSpace, $tempReversalQty);
                            $batch->update([
                                'remaining_qty' => $batch->remaining_qty + $restoreAmount
                            ]);
                            $tempReversalQty -= $restoreAmount;
                        }
                    }

                    if ($tempReversalQty > 0 && $batchesToRestore->count() > 0) {
                        $latestBatch = $batchesToRestore->first();
                        $latestBatch->update([
                            'remaining_qty' => $latestBatch->remaining_qty + $tempReversalQty
                        ]);
                    }
                }
                $sale->saleItem()->delete();

                $newTotalAmount = 0;

                foreach ($validated['items'] as $item) {
                    $productUnit = ProductUnit::findOrFail($item['product_unit_id']);
                    $qtyNeededInBaseUnit = $item['quantity'] * $productUnit->conversion_factor;


                    $product = Product::findOrFail($item['product_id']);
                    $tempQtyNeeded = $qtyNeededInBaseUnit;
                    $totalCostForThisItem = 0;

                    $batches = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $item['product_id'])
                        ->where('purchase_items.remaining_qty', '>', 0)
                        ->orderBy('purchases.transaction_date', 'asc')
                        ->orderBy('purchase_items.created_at', 'asc')
                        ->select('purchase_items.*')
                        ->get();

                    $lastPurchasePrice = 0;

                    foreach ($batches as $batch) {
                        if ($tempQtyNeeded <= 0) break;

                        $takeFromThisBatch = min($batch->remaining_qty, $tempQtyNeeded);
                        $totalCostForThisItem += $takeFromThisBatch * $batch->price;
                        $lastPurchasePrice = $batch->price;

                        $batch->update([
                            'remaining_qty' => $batch->remaining_qty - $takeFromThisBatch
                        ]);

                        $tempQtyNeeded -= $takeFromThisBatch;
                    }

                    if ($tempQtyNeeded > 0) {
                        if ($lastPurchasePrice == 0) {
                            $lastPurchasePrice = $product->cost_price ?? 0;
                        }
                        $totalCostForThisItem += $tempQtyNeeded * $lastPurchasePrice;
                        $tempQtyNeeded = 0;
                    }

                    $costPriceAtSale = $totalCostForThisItem / $qtyNeededInBaseUnit;

                    if ($item['discount_amount'] > 0) {
                        $subtotalItem = $item['quantity'] * $item['discount_amount'];
                        $newTotalAmount += $subtotalItem;
                        $sale->saleItem()->create([
                            'product_id'         => $item['product_id'],
                            'product_unit_id'    => $item['product_unit_id'],
                            'quantity'           => $item['quantity'],
                            'price'              => $item['discount_amount'],
                            'cost_price_at_sale' => $costPriceAtSale,
                            'subtotal'           => $subtotalItem
                        ]);
                    } else {
                        $subtotalItem = $item['quantity'] * $productUnit->price;
                        $newTotalAmount += $subtotalItem;
                        $sale->saleItem()->create([
                            'product_id'         => $item['product_id'],
                            'product_unit_id'    => $item['product_unit_id'],
                            'quantity'           => $item['quantity'],
                            'price'              => $productUnit->price,
                            'cost_price_at_sale' => $costPriceAtSale,
                            'subtotal'           => $subtotalItem
                        ]);
                    }


                    $product->update([
                        'stock' => $product->stock - $qtyNeededInBaseUnit
                    ]);
                }

                $moneyLeft = 0;

                if ($totalMoneyPaidBefore >= $newTotalAmount) {

                    $newRemainingBill = 0;
                    $newStatus = 'paid';
                    $moneyLeft = $totalMoneyPaidBefore - $newTotalAmount;
                } else {
                    $newRemainingBill = $newTotalAmount - $totalMoneyPaidBefore;
                    $newStatus = 'unpaid';
                }

                if ($moneyLeft > 0) {
                    $otherSales = Sale::where('customer_id', $sale->customer_id)
                        ->where('id', '!=', $sale->id)
                        ->where('remaining_bill', '>', 0)
                        ->orderBy('id', 'asc')
                        ->get();

                    foreach ($otherSales as $otherSale) {
                        if ($moneyLeft <= 0) break;

                        $currRemainingBill = (float) $otherSale->remaining_bill;

                        if ($moneyLeft >= $currRemainingBill) {
                            $otherSale->update([
                                'remaining_bill' => 0,
                                'status'         => 'paid'
                            ]);
                            $moneyLeft -= $currRemainingBill;
                        } else {

                            $otherSale->update([
                                'remaining_bill' => $currRemainingBill - $moneyLeft,
                                'status'         => 'unpaid'
                            ]);
                            $moneyLeft = 0;
                        }
                    }
                }

                $sale->update([
                    'customer_id'      => $validated['customer_id'],
                    'transaction_date' => $validated['transaction_date'],
                    'total_amount'     => $newTotalAmount,
                    'remaining_bill'   => $newRemainingBill,
                    'status'           => $newStatus
                ]);

                return $sale;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Sale Updated Successfully',
                'data'    => $sale->load('saleItem'),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => $e->getMessage(),
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('sale update error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $sale = Sale::with(['SaleItem.ProductUnit', 'SaleItem.Product'])->findOrFail($id);
            if ($sale->status === 'paid' || (float)$sale->remaining_bill !== (float)$sale->total_amount) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal menghapus! Transaksi ini sudah dibayar atau memiliki riwayat cicilan aktif.'
                ], 422);
            }
            DB::transaction(function () use ($sale) {
                foreach ($sale->SaleItem as $saleItem) {
                    $product = $saleItem->Product;
                    $qtyToRestore = $saleItem->quantity * $saleItem->ProductUnit->conversion_factor;
                    $tempQtyToRestore = $qtyToRestore;
                    $purchaseBatches = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $saleItem->product_id)
                        ->orderBy('purchases.transaction_date', 'desc')
                        ->orderBy('purchase_items.created_at', 'desc')
                        ->select('purchase_items.*')
                        ->get();

                    foreach ($purchaseBatches as $batch) {
                        if ($tempQtyToRestore <= 0) break;
                        $maxBatchQty = $batch->quantity * $batch->ProductUnit->conversion_factor;
                        $availableSpace = $maxBatchQty - $batch->remaining_qty;

                        if ($availableSpace > 0) {
                            $restoreToThisBatch = min($availableSpace, $tempQtyToRestore);
                            $batch->update([
                                'remaining_qty' => $batch->remaining_qty + $restoreToThisBatch
                            ]);

                            $tempQtyToRestore -= $restoreToThisBatch;
                        }
                    }
                    if ($tempQtyToRestore > 0 && $purchaseBatches->count() > 0) {
                        $latestBatch = $purchaseBatches->first();
                        $latestBatch->update([
                            'remaining_qty' => $latestBatch->remaining_qty + $tempQtyToRestore
                        ]);
                    }
                    $product->update([
                        'stock' => $product->stock + $qtyToRestore
                    ]);
                }
                $sale->SaleItem()->delete();
                $sale->delete();
            });

            return response()->json([
                'status'  => true,
                'message' => 'Sale deleted successfully and stock batches rolled back.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Sale destroy error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
