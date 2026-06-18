<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerPaymentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SupplierPaymentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\FinancialReportController;
use App\Http\Controllers\Api\QrcodeController;
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
    Route::get('/employees/options', [EmployeeController::class, 'getOptions']);
    Route::apiResource('/employees', EmployeeController::class);

    Route::get('/products/options', [ProductController::class, 'getOptions']);
    Route::apiResource('/products', ProductController::class);

    Route::get('/customers/options', [CustomerController::class, 'getOptions']);
    Route::apiResource('/customers', CustomerController::class);

    Route::get('/customer-payments/options', [CustomerPaymentController::class, 'getOptions']);
    Route::apiResource('/customer-payments', CustomerPaymentController::class);

    Route::get('/suppliers/options', [SupplierController::class, 'getOptions']);
    Route::apiResource('/suppliers', SupplierController::class);

    Route::get('/supplier-payments/options', [SupplierPaymentController::class, 'getOptions']);
    Route::apiResource('/supplier-payments', SupplierPaymentController::class);

    Route::get('/purchases/options', [PurchaseController::class, 'getOptions']);
    Route::apiResource('/purchases', PurchaseController::class);

    Route::get('/expenses/options', [ExpenseController::class, 'getOptions']);
    Route::apiResource('/expenses', ExpenseController::class);

    Route::get('/sales/options', [SaleController::class, 'getOptions']);
    Route::apiResource('/sales', SaleController::class);

    Route::get('/attendances/options', [AttendanceController::class, 'getOptions']);
    Route::apiResource('/attendances', AttendanceController::class);

    Route::get('/financial-report', [FinancialReportController::class, 'getProfitLossReport']);
    Route::get('/financial-report/dashboard', [FinancialReportController::class, 'getDashboardData']);

    Route::get('/generate-qr', [QrcodeController::class, 'generateVoucherQrCode']);
});


Route::get("/health", function () {
    return response()->json([
        'stauts' => 'ok',
        'message' => 'Basatami API is Running Successfully',
    ]);
});

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/products/options', [ProductController::class, 'getOptions']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    Route::get('/customers/options', [CustomerController::class, 'getOptions']);
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);

    Route::get('/sales/options', [SaleController::class, 'getOptions']);
    Route::post('/sales/backfill-hpp', [SaleController::class, 'triggerBackfill']);
    Route::get('/sales', [SaleController::class, 'index']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);

    Route::get('/purchases/options', [PurchaseController::class, 'getOptions']);
    Route::get('/purchases', [PurchaseController::class, 'index']);
    Route::get('/purchases/{id}', [PurchaseController::class, 'show']);

    Route::get('suppliers/options', [SupplierController::class, 'getOptions']);
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);

    Route::get('/employees/options', [EmployeeController::class, 'getOptions']);
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);


    Route::get('/financial-report', [FinancialReportController::class, 'getProfitLossReport']);
    Route::get('/financial-report/dashboard', [FinancialReportController::class, 'getDashboardData']);


    Route::middleware('ability:admin')->group(function () {
        Route::apiResource('/products', ProductController::class);

        Route::apiResource('/customers', CustomerController::class);
        Route::apiResource('/customer-payments', CustomerPaymentController::class);

        Route::apiResource('/sales', SaleController::class);

        Route::apiResource('/purchases', PurchaseController::class);

        Route::apiResource('/suppliers', SupplierController::class);
        Route::apiResource('/supplier-payments', SupplierPaymentController::class);

        Route::post('/employees/{employee_id}/attendances', [EmployeeController::class, 'attendance']);
        Route::apiResource('/employees', EmployeeController::class);

        Route::apiResource('/expenses', ExpenseController::class);
        Route::apiResource('/attendances', AttendanceController::class);
    });
});


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
