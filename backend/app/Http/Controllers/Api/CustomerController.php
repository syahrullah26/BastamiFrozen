<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CreateRequest;
use App\Http\Requests\Customer\UpdateRequest;
use App\Http\Resources\CustomerResource;
use Illuminate\Http\JsonResponse;
// use Illuminate\Http\Request;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {

            $query = Customer::with(['sale', 'sale.saleItem', 'customerPayment']);
            $totalUnpaid = $query->clone()->join('sales', 'customers.id', '=', 'sales.customer_id')->where('sales.status', 'unpaid')->count();
            $totalRemainingBills = $query->clone()->join('sales', 'customers.id', '=', 'sales.customer_id')->where('sales.status', 'unpaid')->sum('sales.remaining_bill');
            $data = $query->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Customers Successful',
                'data' => CustomerResource::collection($data)->additional([
                    'meta' => [
                        'stats' => [
                            'total_unpaid' => $totalUnpaid,
                            'total_remaining_bills' => $totalRemainingBills,
                        ]
                    ]
                ])->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('customer index error :' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    public function getOptions(): JsonResponse
    {
        try {
            $data = Customer::latest()->get();
            return response()->json([
                'status' => true,
                'message' => 'Fetch Customers Successful',
                'data' => CustomerResource::collection($data),
            ], 200);
        } catch (\Exception $e) {
            Log::error('customer options error :' . $e->getMessage());
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
            $customer = Customer::create($request->validated());

            return response()->json([
                'status' => true,
                'message' => 'Customer Created Successfully',
                'data' => new CustomerResource($customer),
            ], 201);
        } catch (\Exception $e) {
            Log::error('customer store error : ' . $e->getMessage());
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
            $customer = Customer::with(['sale', 'sale.saleItem', 'customerPayment'])->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Customer Fetched Successfully',
                'data' => new CustomerResource($customer),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Customer Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('customer show error : ' . $e->getMessage());
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
            $customer = Customer::findOrFail($id);
            $customer->update($request->validated());

            return response()->json([
                'status' => true,
                'message' => 'Customer Updated Successfully',
                'data' => new CustomerResource($customer),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Customer Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('customer update error : ' . $e->getMessage());
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
            $customer = Customer::findOrFail($id);
            $name = $customer->name;
            $customer->delete();

            return response()->json([
                'status' => true,
                'message' => 'Customer ' . $name . ' Deleted Successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Customer Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('customer destroy error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }
}
