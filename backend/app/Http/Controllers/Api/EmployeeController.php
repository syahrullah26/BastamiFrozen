<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\CreateRequest;
use App\Http\Requests\Employee\UpdateRequest;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
// use Illuminate\Http\Request;
use App\Http\Resources\EmployeeResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Employee::latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Employee Successful',
                'data' => EmployeeResource::collection($data)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('employee index error : ' . $e->getMessage());
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
            $employee = Employee::create($request->validated());

            return response()->json([
                'status' => true,
                'message' => 'Employee Created Successfully',
                'data' => new EmployeeResource($employee),
            ], 201);
        } catch (\Exception $e) {
            Log::error('employee store error : ' . $e->getMessage());
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
        try {
            $employee = Employee::with('Attendance')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Employee Fetched Successfully',
                'data' => new EmployeeResource($employee),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Employee Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('employee show error : ' . $e->getMessage());
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
            $employee = Employee::findOrFail($id);
            $employee->update($request->validated());
            $name = $employee->name;
            return response()->json([
                'status' => true,
                'message' => 'Employee  ' . $name . ' Updated Successfully',
                'data' => new EmployeeResource($employee),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Employee Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('employee update error : ' . $e->getMessage());
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
            $employee = Employee::findOrFail($id);
            $name = $employee->name;
            $employee->delete();
            return response()->json([
                'status' => true,
                'message' => 'Employee ' . $name . ' Deleted Successfully',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Employee Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('employee destroy error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }
}
