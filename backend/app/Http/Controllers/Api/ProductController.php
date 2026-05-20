<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\CreateRequest;
use App\Http\Requests\Product\UpdateRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;


class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Product::with('ProductUnit')->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Product Successful',
                'data' => ProductResource::collection($data)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('product index error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $product = null;
            DB::transaction(function () use ($validated, &$product) {
                $product = Product::create([
                    'name' => $validated['name'],
                    'stock' => $validated['stock'],
                ]);

                if (!empty($validated['units']) && is_array($validated['units'])) {
                    foreach ($validated['units'] as $unit) {
                        $product->productUnit()->create([
                            'unit_name' => $unit['unit_name'],
                            'conversion_factor' => $unit['conversion_factor'],
                            'price' => $unit['price'],
                        ]);
                    }
                }
            });
            return response()->json([
                'status' => true,
                'message' => 'Product Created Successfully',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Exception $e) {
            Log::error('product store error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        DB::transaction(function () use ($id) {
            try {
                $product = Product::with('ProductUnit')->findOrFail($id);
                $productName = $product->name;
                return response()->json([
                    'status' => true,
                    'message' => 'Fetch Product : ' . $productName . ' Successful',
                    'data' => new ProductResource($product),
                ], 200);
            } catch (ModelNotFoundException $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product Not Found',
                ], 404);
            } catch (\Exception $e) {
                Log::error('product show error : ' . $e->getMessage());
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
        DB::transaction(function () use ($request, $id) {
            try {
                $validated = $request->validated();
                $product = Product::findOrFail($id);
                $product->update([
                    'name' => $validated['name'],
                    'stock' => $validated['stock'],
                ]);

                // if (!empty($validated['units']) && is_array($validated['units'])) {
                //     foreach ($validated['units'] as $unit) {
                //         if (isset($unit['id'])) {
                //             $productUnit = $product->productUnit()->find($unit['id']);
                //             if ($productUnit) {
                //                 $productUnit->update([
                //                     'unit_name' => $unit['unit_name'],
                //                     'conversion_factor' => $unit['conversion_factor'],
                //                     'price' => $unit['price'],
                //                 ]);
                //             }
                //         } else {
                //             $product->productUnit()->create([
                //                 'unit_name' => $unit['unit_name'],
                //                 'conversion_factor' => $unit['conversion_factor'],
                //                 'price' => $unit['price'],
                //             ]);
                //         }
                //     }
                // }
                $product->ProductUnit()->delete();
                if (!empty($validated['units']) && is_array($validated['units'])) {
                    foreach ($validated['units'] as $unit) {
                        $product->productUnit()->create([
                            'unit_name' => $unit['unit_name'],
                            'conversion_factor' => $unit['conversion_factor'],
                            'price' => $unit['price'],
                        ]);
                    }
                }
                return response()->json([
                    'status' => true,
                    'message' => 'Product Updated Successfully',
                    'data' => new ProductResource($product->load('ProductUnit')),
                ], 200);
            } catch (ModelNotFoundException $e) {
                return response()->json([
                    'status' => false,
                    'message' => 'Product Not Found',
                ], 404);
            } catch (\Exception $e) {
                Log::error('product update error : ' . $e->getMessage());
                return response()->json([
                    'status' => false,
                    'message' => 'Internal Server Error' . $e->getMessage(),
                ], 500);
            }
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $product = Product::findOrFail($id);
            $name = $product->name;
            $product->delete();
            return response()->json([
                'status' => true,
                'message' => 'Product ' . $name . ' Deleted Successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Product Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('product destroy error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }
}
