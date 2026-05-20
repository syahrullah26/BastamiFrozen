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
            $data = SupplierPayment::with('Supplier', 'Expense')->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Supplier Payments Successful',
                'data' => SupplierPaymentResource::collection($data)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('supplier payment index error : ' . $e->getMessage());
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
                $activePurchases = Purchase::where('supplier_id', $supplierId)
                    ->where('status', '!=', 'paid')
                    ->orderBy('transaction_date', 'asc')
                    ->get();
                $totalDebt = $activePurchases->sum('remaining_bill');
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
                    'notes'        => $validated['notes'] ?? "Pembayaran hutang FIFO ke Supplier ID: {$supplierId}",
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
                $oldAmount = $payment->amount;
                $newAmount = $validated['amount'];
                $supplierId = $validated['supplier_id'];

                $purchasesToRollback = Purchase::where('supplier_id', $supplierId)
                    ->whereIn('status', ['unpaid', 'paid'])
                    ->orderBy('created_at', 'desc')
                    ->get();

                $rollbackLeft = $oldAmount;
                foreach ($purchasesToRollback as $purchase) {
                    if ($rollbackLeft <= 0) break;
                    $maxRestorable = $purchase->total_bill - $purchase->remaining_bill;

                    if ($maxRestorable > 0) {
                        $restoreAmount = min($rollbackLeft, $maxRestorable);
                        $purchase->remaining_bill += $restoreAmount;

                        $purchase->status = $purchase->remaining_bill >= $purchase->total_bill ? 'unpaid' : 'unpaid';
                        $purchase->save();

                        $rollbackLeft -= $restoreAmount;
                    }
                }
                $totalCurrentDebt = Purchase::where('supplier_id', $supplierId)
                    ->where('status', '!=', 'paid')
                    ->sum('remaining_bill');

                if ($newAmount > $totalCurrentDebt) {
                    throw ValidationException::withMessages([
                        'amount' => "Nominal edit (Rp " . number_format($newAmount) . ") melebihi sisa akumulasi seluruh hutang supplier (Rp " . number_format($totalCurrentDebt) . ")."
                    ]);
                }
                $activePurchases = Purchase::where('supplier_id', $supplierId)
                    ->where('status', '!=', 'paid')
                    ->orderBy('created_at', 'asc')
                    ->get();

                $moneyLeft = $newAmount;
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
                        'notes'        => $validated['notes'] ?? "Update Pembayaran FIFO ke Supplier ID: {$supplierId}",
                    ]);
                }

                return $payment;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Supplier Payment (FIFO) Updated Successfully',
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
    public function destroy(string $id)
    {
        //
    }
}
