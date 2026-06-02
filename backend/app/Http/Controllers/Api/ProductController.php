<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\CreateRequest;
use App\Http\Requests\Product\UpdateRequest;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
// use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;


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

    public function getOptions(): JsonResponse
    {
        try {
            $data = Product::with('ProductUnit')->latest()->get();
            return response()->json([
                'status' => true,
                'message' => 'Fetch Product Successful',
                'data' => ProductResource::collection($data),
            ], 200);
        } catch (\Exception $e) {
            Log::error('product options error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    // Hubungkan dengan facade Intervention Image v3

    public function store(CreateRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $product = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . uniqid() . '.webp';
                $manager = new ImageManager(new Driver());
                $imageWebp = $manager->read($file)->toWebp(80);
                Storage::disk('public')->put('products/' . $filename, (string) $imageWebp);

                $validated['image'] = 'products/' . $filename;
            } else {
                $validated['image'] = null;
            }
            $product = DB::transaction(function () use ($validated) {
                $createdProduct = Product::create([
                    'name'  => $validated['name'],
                    'image' => $validated['image'],
                    'stock' => $validated['stock'],
                ]);

                if (!empty($validated['units']) && is_array($validated['units'])) {
                    foreach ($validated['units'] as $unit) {
                        $createdProduct->productUnit()->create([
                            'unit_name'         => $unit['unit_name'],
                            'conversion_factor' => $unit['conversion_factor'],
                            'price'             => $unit['price'],
                        ]);
                    }
                }
                return $createdProduct;
            });
            $product->load('productUnit');

            return response()->json([
                'status'  => true,
                'message' => 'Product Created Successfully',
                'data'    => new ProductResource($product),
            ], 201);
        } catch (\Exception $e) {
            if (isset($filename) && Storage::disk('public')->exists('products/' . $filename)) {
                Storage::disk('public')->delete('products/' . $filename);
            }

            Log::error('product store error : ' . $e->getMessage());
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
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validated();
            $product = Product::findOrFail($id);
            $oldImage = $product->image;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . uniqid() . '.webp';
                $manager = new ImageManager(new Driver());
                $imageWebp = $manager->read($file)->toWebp(80);
                Storage::disk('public')->put('products/' . $filename, (string) $imageWebp);
                $validated['image'] = 'products/' . $filename;
            } else {
                $validated['image'] = $oldImage;
            }
            $product = DB::transaction(function () use ($validated, $product) {
                $product->update([
                    'name'  => $validated['name'],
                    'image' => $validated['image'],
                    'stock' => $validated['stock'],
                ]);
                $product->productUnit()->delete();
                if (!empty($validated['units']) && is_array($validated['units'])) {
                    foreach ($validated['units'] as $unit) {
                        $product->productUnit()->create([
                            'unit_name'         => $unit['unit_name'],
                            'conversion_factor' => $unit['conversion_factor'],
                            'price'             => $unit['price'],
                        ]);
                    }
                }

                return $product;
            });
            if ($request->hasFile('image') && $oldImage) {
                if (Storage::disk('public')->exists($oldImage)) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
            $product->load('productUnit');

            return response()->json([
                'status'  => true,
                'message' => 'Product Updated Successfully',
                'data'    => new ProductResource($product),
            ], 200);
        } catch (ModelNotFoundException $e) {
            if (isset($filename) && Storage::disk('public')->exists('products/' . $filename)) {
                Storage::disk('public')->delete('products/' . $filename);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Product Not Found',
            ], 404);
        } catch (\Exception $e) {
            if (isset($filename) && Storage::disk('public')->exists('products/' . $filename)) {
                Storage::disk('public')->delete('products/' . $filename);
            }

            Log::error('product update error : ' . $e->getMessage());
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
            $product = Product::findOrFail($id);
            $name = $product->name;
            $imagePath = $product->image;
            DB::transaction(function () use ($product) {
                $product->productUnit()->delete();
                $product->delete();
            });
            if ($imagePath) {
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }

            return response()->json([
                'status'  => true,
                'message' => 'Product ' . $name . ' Deleted Successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Product Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('product destroy error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
