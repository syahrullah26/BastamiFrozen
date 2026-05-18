<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\CreateRequest;
use App\Http\Requests\Supplier\UpdateRequest;
use App\Http\Resources\SupplierResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Supplier::latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Suppliers Successful',
                'data' => SupplierResource::collection($data)->response()->getData(true),
            ]);
        } catch (\Exception $e) {
            Log::error('supplier index error : ' . $e->getMessage());
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
            $supplier = Supplier::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);
            return response()->json([
                'status' => true,
                'message' => 'Supplier Created Successfully',
                'data' => new SupplierResource($supplier),
            ], 201);
        } catch (\Exception $e) {
            Log::error('supplier store error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $supplier = Supplier::with(['Purchase', 'SupplierPayment'])->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Supplier Successful',
                'data' => new SupplierResource($supplier->load('Purchase', 'SupplierPayment')),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Supplier Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('supplier show error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, string $id): JsonResponse
    {
        try {
            $supplier = Supplier::findOrFail($id);
            $validated = $request->validated();
            $supplier->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);
            return response()->json([
                'status' => true,
                'message' => 'Supplier Updated Successfully',
                'data' => new SupplierResource($supplier),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Supplier Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('supplier update error : ' . $e->getMessage());
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
        try {
            $supplier = Supplier::findOrFail($id);
            $name = $supplier->name;
            $supplier->delete();
            return response()->json([
                'status' => true,
                'message' => 'Supplier ' . $name . ' Deleted Successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Supplier Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('supplier destroy error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }
}
