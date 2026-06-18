<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use App\Models\SupplierPayment;
use App\Http\Resources\SupplierPaymentResource;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Purchase;

class SupplierPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $query = SupplierPayment::with('Supplier', 'Expense');
            $data = $query->latest()->paginate(10);

            $totalCashOutFlow = $query->clone()->sum('amount');
            return response()->json([
                'status' => true,
                'message' => 'Fetch Supplier Payments Successful',
                'data' => SupplierPaymentResource::collection($data)->additional([
                    'meta' => [
                        'stats' => [
                            'total_cash_out_flow' => $totalCashOutFlow,
                        ]
                    ]
                ])->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('supplier payment index error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    public function getOptions(): JsonResponse
    {
        try {
            $data = SupplierPayment::with('Supplier', 'Expense')->latest()->get();
            return response()->json([
                'status' => true,
                'message' => 'Fetch Supplier Payments Successful',
                'data' => SupplierPaymentResource::collection($data),
            ], 200);
        } catch (\Exception $e) {
            Log::error('supplier payment options error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'supplier_id'  => 'required|exists:suppliers,id',
                'amount'       => 'required|numeric|min:1',
                'payment_date' => 'required|date',
                'notes'        => 'nullable|string',
            ]);

            $paymentData = DB::transaction(function () use ($validated) {
                $supplierId = $validated['supplier_id'];
                $paymentAmount = $validated['amount'];
                $supplier = Supplier::findOrFail($supplierId);
                $supplierName = $supplier->name;

                $totalDebt = Purchase::where('supplier_id', $supplierId)
                    ->where('remaining_bill', '>', 0)
                    ->sum('remaining_bill');

                if ($totalDebt <= 0) {
                    throw ValidationException::withMessages([
                        'amount' => 'Supplier ini tidak memiliki sisa hutang yang perlu dibayar.'
                    ]);
                }

                if ($paymentAmount > $totalDebt) {
                    throw ValidationException::withMessages([
                        'amount' => "Jumlah pembayaran (Rp " . number_format($paymentAmount) . ") melebihi total akumulasi hutang supplier (Rp " . number_format($totalDebt) . ")."
                    ]);
                }

                $activePurchases = Purchase::where('supplier_id', $supplierId)
                    ->where('remaining_bill', '>', 0)
                    ->orderBy('id', 'asc')
                    ->get();

                $payment = SupplierPayment::create([
                    'supplier_id'  => $supplierId,
                    'amount'       => $paymentAmount,
                    'payment_date' => $validated['payment_date'],
                    'notes'        => $validated['notes'],
                ]);

                $payment->expense()->create([
                    'type'         => 'pay_supplier',
                    'amount'       => $paymentAmount,
                    'expense_date' => $validated['payment_date'],
                    'notes'        => $validated['notes'] ?? "Pembayaran hutang FIFO ke Supplier Name: {$supplierName}",
                ]);

                $moneyLeft = $paymentAmount;
                foreach ($activePurchases as $purchase) {
                    if ($moneyLeft <= 0) break;

                    $currentRemainingBill = $purchase->remaining_bill;

                    if ($moneyLeft >= $currentRemainingBill) {
                        $moneyLeft -= $currentRemainingBill;
                        $purchase->update([
                            'remaining_bill' => 0,
                            'status'         => 'paid'
                        ]);
                    } else {
                        $purchase->update([
                            'remaining_bill' => $currentRemainingBill - $moneyLeft,
                            'status'         => 'unpaid'
                        ]);
                        $moneyLeft = 0;
                    }
                }

                return $payment;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Supplier Payment Created Successfully (FIFO)',
                'data'    => new SupplierPaymentResource($paymentData),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Store Supplier Payment FIFO Error: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $supplierPayment = SupplierPayment::with('Supplier', 'Expense')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Supplier Payment Successful',
                'data' => new SupplierPaymentResource($supplierPayment),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Supplier Payment Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('supplier payment show error : ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Internal Server Error' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'supplier_id'  => 'required|exists:suppliers,id',
                'amount'       => 'required|numeric|min:1',
                'payment_date' => 'required|date',
                'notes'        => 'nullable|string',
            ]);

            $updatedPayment = DB::transaction(function () use ($validated, $id) {
                $payment = SupplierPayment::findOrFail($id);
                $supplierId = $validated['supplier_id'];
                $supplier = Supplier::findOrFail($supplierId);
                $supplierName = $supplier->name;
                $newAmount = $validated['amount'];

                $allPurchases = Purchase::where('supplier_id', $supplierId)->get();
                foreach ($allPurchases as $purchase) {
                    $originalAmount = $purchase->total_amount ?? $purchase->total_bill ?? 0;

                    $purchase->update([
                        'remaining_bill' => $originalAmount,
                        'status'         => $originalAmount > 0 ? 'unpaid' : 'paid'
                    ]);
                }

                $otherPayments = SupplierPayment::where('supplier_id', $supplierId)
                    ->where('id', '!=', $id)
                    ->orderBy('id', 'asc')
                    ->get();
                $totalMoneyToAllocate = $otherPayments->sum('amount') + $newAmount;
                $purchasesToPay = Purchase::where('supplier_id', $supplierId)
                    ->orderBy('id', 'asc')
                    ->get();

                $moneyLeft = $totalMoneyToAllocate;
                foreach ($purchasesToPay as $purchase) {
                    if ($moneyLeft <= 0) break;

                    $currentRemainingBill = $purchase->remaining_bill;

                    if ($moneyLeft >= $currentRemainingBill) {
                        $moneyLeft -= $currentRemainingBill;
                        $purchase->update([
                            'remaining_bill' => 0,
                            'status'         => 'paid'
                        ]);
                    } else {
                        $purchase->update([
                            'remaining_bill' => $currentRemainingBill - $moneyLeft,
                            'status'         => 'unpaid'
                        ]);
                        $moneyLeft = 0;
                    }
                }
                $payment->update([
                    'supplier_id'  => $supplierId,
                    'amount'       => $newAmount,
                    'payment_date' => $validated['payment_date'],
                    'notes'        => $validated['notes'],
                ]);

                if ($payment->expense) {
                    $payment->expense->update([
                        'amount'       => $newAmount,
                        'expense_date' => $validated['payment_date'],
                        'notes'        => $validated['notes'] ?? "Update Pembayaran FIFO ke Supplier Name: {$supplierName}",
                    ]);
                }

                return $payment;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Supplier Payment (FIFO) Reset & Updated Successfully',
                'data'    => new SupplierPaymentResource($updatedPayment),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Data Pembayaran Tidak Ditemukan'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Update Supplier Payment FIFO Error: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $payment = SupplierPayment::with('expense')->findOrFail($id);
                $supplierId = $payment->supplier_id;

                $allPurchases = Purchase::where('supplier_id', $supplierId)->get();
                foreach ($allPurchases as $purchase) {
                    $originalAmount = $purchase->total_amount ?? $purchase->total_bill ?? 0;

                    $purchase->update([
                        'remaining_bill' => $originalAmount,
                        'status'         => $originalAmount > 0 ? 'unpaid' : 'paid'
                    ]);
                }
                $otherPayments = SupplierPayment::where('supplier_id', $supplierId)
                    ->where('id', '!=', $id)
                    ->get();

                $totalMoneyToAllocate = $otherPayments->sum('amount');
                if ($totalMoneyToAllocate > 0) {
                    $purchasesToPay = Purchase::where('supplier_id', $supplierId)
                        ->where('remaining_bill', '>', 0)
                        ->orderBy('id', 'asc')
                        ->get();

                    $moneyLeft = $totalMoneyToAllocate;
                    foreach ($purchasesToPay as $purchase) {
                        if ($moneyLeft <= 0) break;

                        $currentRemainingBill = $purchase->remaining_bill;

                        if ($moneyLeft >= $currentRemainingBill) {
                            $moneyLeft -= $currentRemainingBill;
                            $purchase->update([
                                'remaining_bill' => 0,
                                'status'         => 'paid'
                            ]);
                        } else {
                            $purchase->update([
                                'remaining_bill' => $currentRemainingBill - $moneyLeft,
                                'status'         => 'unpaid'
                            ]);
                            $moneyLeft = 0;
                        }
                    }
                }
                if ($payment->expense) {
                    $payment->expense->delete();
                }

                $payment->delete();
            });

            return response()->json([
                'status'  => true,
                'message' => 'Supplier Payment deleted, FIFO rolled back, and related expense removed successfully',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Data Pembayaran Tidak Ditemukan'], 404);
        } catch (\Exception $e) {
            Log::error('Destroy Supplier Payment FIFO Error: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }
}
