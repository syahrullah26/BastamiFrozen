<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\UpdateRequest;
use App\Http\Requests\Purchase\CreateRequest;
use App\Http\Resources\PurchaseResource;
use App\Models\Purchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PurchaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Purchase::with('Supplier', 'PurchaseItem', 'PurchaseItem.Product', 'PurchaseItem.Product.ProductUnit')->latest()->paginate(10);
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
        DB::transaction(function () use ($request) {
            try {
                $validated = $request->validated();

                $invoiceNumber = "ORD/" . date('Ymd') . "/" . str_pad(Purchase::count() + 1, 4, '0', STR_PAD_LEFT);
                $purchase = Purchase::create([
                    'purchase_number' => $invoiceNumber,
                    'supplier_id' => $validated['supplier_id'],
                    'date' => $validated['date'],
                    'total_amount' => 0,
                ]);
                foreach ($validated['items'] as $item) {
                    $totalAmount += $item['quantity'] * $item['unit_price'];
                    $purchase->purchaseItem()->create([
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                    ]);
                }
                $purchase->update([
                    'total_amount' => $totalAmount,
                ]);
                if ($purchase) {
                    return response()->json([
                        'status' => true,
                        'message' => 'Purchase Created Successfully',
                        'data' => new PurchaseResource($purchase),
                    ], 201);
                }
            } catch (\Exception $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Internal Server Error' . $e->getMessage(),
                ], 500);
            }
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        DB::transaction(function () use ($id) {
            try {
                $purchase = Purchase::with('Supplier', 'PurchaseItem', 'PurchaseItem.Product', 'PurchaseItem.Product.ProductUnit')->findOrFail($id);
                return response()->json([
                    'status' => true,
                    'message' => 'Fetch Purchase Successful',
                    'data' => new PurchaseResource($purchase),
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

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, string $id)
    {
        try {
            $validated = $request->validated();
            $purchase = Purchase::findOrFail($id);
            $purchase->update([
                'supplier_id' => $validated['supplier_id'],
                'date' => $validated['date'],
                'total_amount' => 0,
            ]);
            $purchase->PurchaseItem()->delete();
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
                $purchase->purchaseItem()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }
            $purchase->update([
                'total_amount' => $totalAmount,
            ]);
            return response()->json([
                'status' => true,
                'message' => 'Purchase Updated Successfully',
                'data' => new PurchaseResource($purchase),
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
