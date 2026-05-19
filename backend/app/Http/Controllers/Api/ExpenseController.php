<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\ExpenseResource;
use App\Http\Requests\Expense\CreateRequest as ExpenseCreate;
use App\Http\Requests\Expense\UpdateRequest as ExpenseUpdate;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = Expense::with('Attendance', 'SupplierPayment')->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Expenses Successful',
                'data' => ExpenseResource::collection($data)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('expense index error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ExpenseCreate $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $expense = Expense::create([
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'expense_date' => $validated['expense_date'],
                'notes' => $validated['notes'],
                'attendance_id' => null,
                'supplier_payment_id' => null
            ]);
            return response()->json([
                'status' => true,
                'message' => 'Expense Created Successfully',
                'data' => new ExpenseResource($expense),
            ], 201);
        } catch (\Exception $e) {
            Log::error('expense store error : ' . $e->getMessage());
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
            $expense = Expense::with('Attendance', 'SupplierPayment')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Expense Fetched Successfully',
                'data' => new ExpenseResource($expense),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Expense Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('expense show error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ExpenseUpdate $request, string $id): JsonResponse
    {
        try {
            $expense = Expense::findOrFail($id);
            $validated = $request->validated();
            if (in_array($expense->type, ['pay_supplier', 'salary'])) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Alert, Pengeluaran otomatis dari sistem (pembelian/gaji) tidak boleh diedit langsung.',
                ], 400);
            }

            if (in_array($validated['type'], ['pay_supplier', 'salary'])) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No Authorization! Pengeluaran otomatis dari sistem (pembelian/gaji) tidak boleh diedit langsung.',
                ], 400);
            }

            $expense->update([
                'type'         => $validated['type'],
                'amount'       => $validated['amount'],
                'expense_date' => $validated['expense_date'],
                'notes'        => $validated['notes'],
                'attendance_id'       => null,
                'supplier_payment_id' => null
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Expense Updated Successfully',
                'data'    => new ExpenseResource($expense),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Expense Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('expense update error : ' . $e->getMessage());
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
        try {
            $expense = Expense::findOrFail($id);
            if (in_array($expense->type, ['pay_supplier', 'salary'])) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Gagal menghapus! Pengeluaran otomatis dari sistem (pembelian/gaji) tidak boleh dihapus langsung dari modul ini.',
                ], 400);
            }
            $expense->delete();
            return response()->json([
                'status'  => true,
                'message' => 'Expense Deleted Successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Expense Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('expense destroy error : ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
