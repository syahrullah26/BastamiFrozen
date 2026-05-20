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
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Sale::with('Customer', 'SaleItem', 'SaleItem.Product', 'SaleItem.ProductUnit')->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Sales Successful',
                'data' => SaleResource::collection($data)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('sale index error : ' . $e->getMessage());
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

                $invoiceNumber = "INV/" . date('dmY') . "/" . str_pad(Sale::count() + 1, 4, '0', STR_PAD_LEFT);
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
                    $subtotalItem = $item['quantity'] * $productUnit->price;
                    $totalAmount += $subtotalItem;
                    $product = Product::findOrFail($item['product_id']);
                    if ($product->stock < $qtyNeededInBaseUnit) {
                        throw ValidationException::withMessages([
                            'items' => "Stok produk '{$product->name}' tidak mencukupi. Sisa stok: " . ($product->stock / $productUnit->conversion_factor) . " " . $productUnit->unit_name
                        ]);
                    }

                    $tempQtyNeeded = $qtyNeededInBaseUnit;
                    $totalCostForThisItem = 0;

                    $batches = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $item['product_id'])
                        ->where('purchase_items.remaining_qty', '>', 0)
                        ->orderBy('purchases.transaction_date', 'asc')
                        ->orderBy('purchase_items.created_at', 'asc')
                        ->select('purchase_items.*')
                        ->get();

                    foreach ($batches as $batch) {
                        if ($tempQtyNeeded <= 0) break;
                        $takeFromThisBatch = min($batch->remaining_qty, $tempQtyNeeded);
                        $totalCostForThisItem += $takeFromThisBatch * $batch->price;
                        $batch->update([
                            'remaining_qty' => $batch->remaining_qty - $takeFromThisBatch
                        ]);
                        $tempQtyNeeded -= $takeFromThisBatch;
                    }

                    if ($tempQtyNeeded > 0) {
                        throw ValidationException::withMessages([
                            'items' => "Gagal memproses FIFO untuk '{$product->name}'. Terjadi ketidaksinkronan batch data stok."
                        ]);
                    }

                    $costPriceAtSale = $totalCostForThisItem / $qtyNeededInBaseUnit;

                    $sale->SaleItem()->create([
                        'product_id'         => $item['product_id'],
                        'product_unit_id'    => $item['product_unit_id'],
                        'quantity'           => $item['quantity'],
                        'price'              => $productUnit->price,
                        'cost_price_at_sale' => $costPriceAtSale,
                        'subtotal'           => $subtotalItem
                    ]);

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
                $sale = Sale::with('SaleItem.ProductUnit')->findOrFail($id);

                if ($sale->status === 'paid') {
                    throw ValidationException::withMessages([
                        'status' => 'Nota penjualan yang sudah lunas tidak dapat diedit kembali. Silakan lakukan retur.'
                    ]);
                }

                foreach ($sale->saleItem as $oldItem) {
                    $oldProductUnit = $oldItem->productUnit;
                    $oldQtyInBaseUnit = $oldItem->quantity * $oldProductUnit->conversion_factor;

                    $product = Product::findOrFail($oldItem->product_id);
                    $product->update([
                        'stock' => $product->stock + $oldQtyInBaseUnit
                    ]);

                    $tempReversalQty = $oldQtyInBaseUnit;

                    $batchesToRestore = PurchaseItem::where('product_id', $oldItem->product_id)
                        ->orderBy('created_at', 'desc')
                        ->get();

                    foreach ($batchesToRestore as $batch) {
                        if ($tempReversalQty <= 0) break;

                        $batch->update([
                            'remaining_qty' => $batch->remaining_qty + $tempReversalQty
                        ]);

                        $tempReversalQty = 0;
                    }
                }

                $sale->saleItem()->delete();
                $totalAmount = 0;

                foreach ($validated['items'] as $item) {
                    $productUnit = ProductUnit::findOrFail($item['product_unit_id']);
                    $qtyNeededInBaseUnit = $item['quantity'] * $productUnit->conversion_factor;
                    $subtotalItem = $item['quantity'] * $productUnit->price;
                    $totalAmount += $subtotalItem;

                    $product = Product::findOrFail($item['product_id']);
                    if ($product->stock < $qtyNeededInBaseUnit) {
                        throw ValidationException::withMessages([
                            'items' => "Stok produk '{$product->name}' tidak mencukupi untuk data baru. Sisa stok tersedia: " . ($product->stock / $productUnit->conversion_factor) . " " . $productUnit->unit_name
                        ]);
                    }

                    $tempQtyNeeded = $qtyNeededInBaseUnit;
                    $totalCostForThisItem = 0;

                    $batches = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                        ->where('purchase_items.product_id', $item['product_id'])
                        ->where('purchase_items.remaining_qty', '>', 0)
                        ->orderBy('purchases.transaction_date', 'asc')
                        ->orderBy('purchase_items.created_at', 'asc')
                        ->select('purchase_items.*')
                        ->get();

                    foreach ($batches as $batch) {
                        if ($tempQtyNeeded <= 0) break;

                        $takeFromThisBatch = min($batch->remaining_qty, $tempQtyNeeded);
                        $totalCostForThisItem += $takeFromThisBatch * $batch->price;

                        $batch->update([
                            'remaining_qty' => $batch->remaining_qty - $takeFromThisBatch
                        ]);

                        $tempQtyNeeded -= $takeFromThisBatch;
                    }

                    if ($tempQtyNeeded > 0) {
                        throw ValidationException::withMessages([
                            'items' => "Gagal memproses ulang FIFO untuk '{$product->name}'. Terjadi selisih batch stok."
                        ]);
                    }

                    $costPriceAtSale = $totalCostForThisItem / $qtyNeededInBaseUnit;

                    $sale->saleItem()->create([
                        'product_id'         => $item['product_id'],
                        'product_unit_id'    => $item['product_unit_id'],
                        'quantity'           => $item['quantity'],
                        'price'              => $productUnit->price,
                        'cost_price_at_sale' => $costPriceAtSale,
                        'subtotal'           => $subtotalItem
                    ]);

                    $product->update([
                        'stock' => $product->stock - $qtyNeededInBaseUnit
                    ]);
                }

                $sale->update([
                    'customer_id'      => $validated['customer_id'],
                    'transaction_date' => $validated['transaction_date'],
                    'total_amount'     => $totalAmount,
                    'remaining_bill'   => $totalAmount,
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
    public function destroy(string $id)
    {
        //
    }
}
