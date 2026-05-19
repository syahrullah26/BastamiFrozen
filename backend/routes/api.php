<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SaleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix('test')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'message' => 'API Test is Ready',
        ]);
    });
    Route::post('/employees/{employee_id}/attendances', [EmployeeController::class, 'attendance']);
    Route::apiResource('/employees', EmployeeController::class);

    Route::apiResource('/products', ProductController::class);

    Route::apiResource('/customers', CustomerController::class);

    Route::apiResource('/suppliers', SupplierController::class);

    Route::post('/purchases/{purchase_id}/payments', [PurchaseController::class, 'paymentSupplier']);
    Route::apiResource('/purchases', PurchaseController::class);

    Route::apiResource('/expenses', ExpenseController::class);

    Route::apiResource('/sales', SaleController::class);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
