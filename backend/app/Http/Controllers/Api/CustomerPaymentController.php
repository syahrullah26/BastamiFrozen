<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\CustomerPaymentResource;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundExceptionl;
use App\Models\Sale;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CustomerPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $data = CustomerPayment::with(['Customer', 'Customer.Sale', 'Customer.Sale.SaleItem', 'Customer.Sale.SaleItem.Product', 'Customer.Sale.SaleItem.ProductUnit'])->latest()->paginate(10);
            return response()->json([
                'status' => true,
                'message' => 'Fetch Customer Payments Successful',
                'data' => CustomerPaymentResource::collection($data)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('customer payment index error : ' . $e->getMessage());
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
                'customer_id' => 'required|exists:customers,id',
                'amount' => 'required|numeric|min:1',
                'payment_date' => 'required|date',
                'notes' => 'nullable|string',
            ]);

            $paymentData = DB::transaction(function () use ($validated) {
                $customerId = $validated['customer_id'];
                $paymentAmount = $validated['amount'];
                $activeSales = Sale::where('customer_id', $customerId)->where('status', '!=', 'paid')->orderBy('transaction_date', 'asc')->get();
                $totalDebt = $activeSales->sum('remaining_bill');
                if ($totalDebt <= 0) {
                    throw ValidationException::withMessages([
                        'amount' => 'Customer ini tidak memiliki sisa hutang yang perlu dibayar.'
                    ]);
                }

                if ($paymentAmount > $totalDebt) {
                    throw ValidationException::withMessages([
                        'amount' => "Jumlah pembayaran (Rp " . number_format($paymentAmount) . ") melebihi total akumulasi hutang customer (Rp " . number_format($totalDebt) . ")."
                    ]);
                }
                $payment = CustomerPayment::create([
                    'customer_id' => $customerId,
                    'amount' => $paymentAmount,
                    'payment_date' => $validated['payment_date'],
                    'notes' => $validated['notes'],
                ]);
                $moneyLeft = $paymentAmount;
                foreach ($activeSales as $sale) {
                    if ($moneyLeft <= 0) break;
                    $currentRemainingBill = $sale->remaining_bill;
                    if ($moneyLeft >= $currentRemainingBill) {
                        $moneyLeft -= $currentRemainingBill;
                        $sale->update([
                            'remaining_bill' => 0,
                            'status' => 'paid',
                        ]);
                    } else {
                        $sale->update([
                            'remaining_bill' => $currentRemainingBill - $moneyLeft,
                        ]);
                        $moneyLeft = 0;
                    }
                }
                return $payment;
            });

            return response()->json([
                'status' => true,
                'message' => 'Customer Payment Created Successfully',
                'data' => new CustomerPaymentResource($paymentData),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error' . $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('customer payment store error : ' . $e->getMessage());
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
            $customerPayment = CustomerPayment::with(['Customer', 'Customer.Sale', 'Customer.Sale.SaleItem', 'Customer.Sale.SaleItem.Product', 'Customer.Sale.SaleItem.ProductUnit'])->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Customer Payment Fetched Successfully',
                'data' => new CustomerPaymentResource($customerPayment),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Customer Payment Not Found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('customer payment show error : ' . $e->getMessage());
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
                'customer_id'  => 'required|exists:Customers,id',
                'amount'       => 'required|numeric|min:1',
                'payment_date' => 'required|date',
                'notes'        => 'nullable|string',
            ]);

            $updatedPayment = DB::transaction(function () use ($validated, $id) {
                $payment = CustomerPayment::findOrFail($id);
                $oldAmount = $payment->amount;
                $newAmount = $validated['amount'];
                $customerID = $validated['customer_id'];

                $salesToRollback = sale::where('customer_id', $customerID)
                    ->whereIn('status', ['unpaid', 'paid'])
                    ->orderBy('transaction_date', 'desc')
                    ->get();

                $rollbackLeft = $oldAmount;
                foreach ($salesToRollback as $sale) {
                    if ($rollbackLeft <= 0) break;
                    $maxRestorable = $sale->total_bill - $sale->remaining_bill;

                    if ($maxRestorable > 0) {
                        $restoreAmount = min($rollbackLeft, $maxRestorable);
                        $sale->remaining_bill += $restoreAmount;

                        $sale->status = $sale->remaining_bill >= $sale->total_bill ? 'unpaid' : 'unpaid';
                        $sale->save();

                        $rollbackLeft -= $restoreAmount;
                    }
                }
                $totalCurrentDebt = Sale::where('customer_id', $customerID)
                    ->where('status', '!=', 'paid')
                    ->sum('remaining_bill');

                if ($newAmount > $totalCurrentDebt) {
                    throw ValidationException::withMessages([
                        'amount' => "Nominal edit (Rp " . number_format($newAmount) . ") melebihi sisa akumulasi seluruh hutang Customer (Rp " . number_format($totalCurrentDebt) . ")."
                    ]);
                }
                $activesales = Sale::where('customer_id', $customerID)
                    ->where('status', '!=', 'paid')
                    ->orderBy('created_at', 'asc')
                    ->get();

                $moneyLeft = $newAmount;
                foreach ($activesales as $sale) {
                    if ($moneyLeft <= 0) break;

                    $currentRemainingBill = $sale->remaining_bill;

                    if ($moneyLeft >= $currentRemainingBill) {
                        $moneyLeft -= $currentRemainingBill;
                        $sale->update([
                            'remaining_bill' => 0,
                            'status'         => 'paid'
                        ]);
                    } else {
                        $sale->update([
                            'remaining_bill' => $currentRemainingBill - $moneyLeft,
                            'status'         => 'unpaid'
                        ]);
                        $moneyLeft = 0;
                    }
                }
                $payment->update([
                    'customer_id'  => $customerID,
                    'amount'       => $newAmount,
                    'payment_date' => $validated['payment_date'],
                    'notes'        => $validated['notes'],
                ]);
                return $payment;
            });

            return response()->json([
                'status'  => true,
                'message' => 'Customer Payment (FIFO) Updated Successfully',
                'data'    => new CustomerPaymentResource($updatedPayment),
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Data Pembayaran Tidak Ditemukan'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Update Customer Payment FIFO Error: ' . $e->getMessage());
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
