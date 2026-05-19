<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\CreateRequest;
use App\Http\Requests\Employee\UpdateRequest;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Resources\EmployeeResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

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

    public function attendance(Request $request, string $id): JsonResponse
    {
        try {
            $employee = Employee::findOrFail($id);

            $validated = $request->validate([
                'employee_id'    => 'required|exists:employees,id',
                'attendace_date' => 'required|date',
                'status'         => 'required|in:present,absent,leave,leave_with_permission',
                'notes'          => 'nullable|string',
            ]);

            $attendance = DB::transaction(function () use ($employee, $validated) {

                $attendance = $employee->attendance()->create([
                    'attendace_date' => $validated['attendace_date'],
                    'status'         => $validated['status'],
                    'notes'          => $validated['notes'],
                ]);

                if ($validated['status'] === 'present') {
                    $attendance->expense()->create([
                        'type'                => 'salary',
                        'amount'              => $employee->salary,
                        'expense_date'        => $validated['attendace_date'],
                        'notes'               =>  "Gaji harian atas kehadiran tanggal " . $validated['attendace_date'] . "atas nama " . $employee->name,
                        'supplier_payment_id' => null
                    ]);
                }

                return $attendance;
            });

            $employee->load(['attendance' => function ($query) use ($validated) {
                $query->where('attendace_date', $validated['attendace_date']);
            }]);

            return response()->json([
                'status'  => true,
                'message' => 'Attendance Created Successfully',
                'data'    => new EmployeeResource($employee),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('employee attendance store error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
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
        } catch (ModelNotFoundException $e) {
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
        } catch (ModelNotFoundException $e) {
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
        } catch (ModelNotFoundException $e) {
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
