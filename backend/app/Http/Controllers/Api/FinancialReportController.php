<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;


class FinancialReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function getProfitLossReport(Request $request)
    {
        $type = $request->query('type', 'monthly');
        $dateInput = $request->query('date', Carbon::now()->toDateString());

        try {
            $carbonDate = Carbon::parse($dateInput);
        } catch (\Exception $e) {
            $carbonDate = Carbon::now();
        }


        if ($type === 'daily') {
            $startDate = $carbonDate->startOfDay()->toDateTimeString();
            $endDate = $carbonDate->endOfDay()->toDateTimeString();
            $periodLabel = $carbonDate->translatedFormat('d F Y');
        } elseif ($type === 'weekly') {
            $startDate = $carbonDate->startOfWeek()->toDateTimeString();
            $endDate = $carbonDate->endOfWeek()->toDateTimeString();
            $periodLabel = 'Minggu Ke-' . $carbonDate->weekOfYear . ' (' . $carbonDate->startOfWeek()->format('d M') . ' - ' . $carbonDate->endOfWeek()->format('d M Y') . ')';
        } else {
            $startDate = $carbonDate->startOfMonth()->toDateTimeString();
            $endDate = $carbonDate->endOfMonth()->toDateTimeString();
            $periodLabel = $carbonDate->translatedFormat('F Y');
        }

        $financialData = DB::table('sales')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('
        COUNT(id) as total_orders,
        SUM(total_amount) as gross_revenue
    ')
            ->first();

        $cogsData = DB::table('sales')
            ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')
            ->join('product_units', 'sale_items.product_unit_id', '=', 'product_units.id')
            ->whereBetween('sales.transaction_date', [$startDate, $endDate])
            ->selectRaw('SUM((sale_items.quantity * product_units.conversion_factor) * sale_items.cost_price_at_sale) as total_cogs')
            ->first();

        $totalOrders  = (int) ($financialData->total_orders ?? 0);
        $grossRevenue = (float) ($financialData->gross_revenue ?? 0);
        $totalCogs    = (float) ($cogsData->total_cogs ?? 0);

        // $totalOrders  = (int) ($financialData->total_orders ?? 0);
        // $grossRevenue = (float) ($financialData->gross_revenue ?? 0);
        // $totalCogs    = (float) ($financialData->total_cogs ?? 0);
        $grossProfit  = $grossRevenue - $totalCogs;


        $expensesBreakdown = DB::table('expenses')
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->select('type', DB::raw('SUM(amount) as total'))
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->type,
                    'total'    => (float) $item->total
                ];
            });

        $totalExpenses = $expensesBreakdown->sum('total');
        $netProfitLoss = $grossProfit - $totalExpenses;

        $profitMargin = $grossRevenue > 0 ? ($netProfitLoss / $grossRevenue) * 100 : 0;
        $averageOrderValue = $totalOrders > 0 ? $grossRevenue / $totalOrders : 0;

        $chartData = [];
        if ($type === 'monthly') {
            $chartData = DB::table('sales')
                ->leftJoin('sale_items', 'sales.id', '=', 'sale_items.sale_id')
                ->whereBetween('sales.transaction_date', [$startDate, $endDate])
                ->selectRaw('DATE(sales.transaction_date) as date, SUM(sale_items.subtotal) as revenue')
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get()
                ->map(function ($row) {
                    return [
                        'label' => Carbon::parse($row->date)->format('d M'),
                        'revenue' => (float) $row->revenue
                    ];
                });
        }

        return response()->json([
            'status' => true,
            'message' => 'Financial report fetched successfully',
            'data' => [
                'summary' => [
                    'period_label'        => $periodLabel,
                    'total_orders'        => $totalOrders,
                    'average_order_value' => (float) $averageOrderValue,
                    'gross_revenue'       => $grossRevenue,
                    'total_cogs'          => $totalCogs,
                    'gross_profit'        => $grossProfit,
                    'total_expenses'      => (float) $totalExpenses,
                    'net_profit_loss'     => $netProfitLoss,
                    'profit_margin_pct'   => round($profitMargin, 2),
                    'is_profit'           => $netProfitLoss >= 0
                ],
                'expenses_breakdown' => $expensesBreakdown,
                'chart_data'         => $chartData
            ]
        ]);
    }


    public function getDashboardData(Request $request)
    {
        $type = $request->query('type', 'daily');
        $dateInput = $request->query('date', Carbon::now()->toDateString());

        try {
            $carbonDate = Carbon::parse($dateInput);
        } catch (\Exception $e) {
            $carbonDate = Carbon::now();
        }
        if ($type === 'daily') {
            $startDate = $carbonDate->copy()->startOfWeek()->toDateTimeString();
            $endDate = $carbonDate->copy()->endOfWeek()->toDateTimeString();
        } elseif ($type === 'weekly') {
            $startDate = $carbonDate->copy()->startOfMonth()->toDateTimeString();
            $endDate = $carbonDate->copy()->endOfMonth()->toDateTimeString();
        } else {
            $startDate = $carbonDate->copy()->startOfYear()->toDateTimeString();
            $endDate = $carbonDate->copy()->endOfYear()->toDateTimeString();
        }

        $salesData = DB::table('sales')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw("
            COUNT(id) as total_orders,
            SUM(total_amount) as gross_revenue
        ")
            ->first();

        $totalCashReceived = (float) DB::table('customer_payments')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount');


        $allTimeSales = DB::table('sales')->sum('total_amount');
        $allTimePayments = DB::table('customer_payments')->sum('amount');
        $totalReceivable = (float) ($allTimeSales - $allTimePayments);


        $zeroCogsAlertCount = DB::table('sales')
            ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')
            ->where(function ($query) {
                $query->where('sale_items.cost_price_at_sale', 0)
                    ->orWhereNull('sale_items.cost_price_at_sale');
            })
            ->count('sale_items.id');


        $topProducts = DB::table('sales')
            ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('product_units as current_unit', 'sale_items.product_unit_id', '=', 'current_unit.id')
            ->join('product_units as base_unit', function ($join) {
                $join->on('products.id', '=', 'base_unit.product_id')
                    ->where('base_unit.conversion_factor', '=', 1);
            })
            ->select(
                'sale_items.product_id',
                'products.name as product_name',
                'base_unit.unit_name',
                DB::raw('SUM(sale_items.quantity * current_unit.conversion_factor) as total_qty_sold'),
                DB::raw('COUNT(DISTINCT sales.id) as total_times_ordered')
            )
            ->groupBy('sale_items.product_id', 'products.name', 'base_unit.unit_name')
            ->orderBy('total_qty_sold', 'DESC')
            ->limit(5)
            ->get();


        $topAgingReceivables = DB::table('sales')
            ->join('customers', 'sales.customer_id', '=', 'customers.id')
            ->select(
                'customers.name as customer_name',
                'sales.customer_id',
                DB::raw("SUBSTRING_INDEX(GROUP_CONCAT(sales.invoice_number ORDER BY sales.transaction_date ASC, sales.id ASC), ',', 1) as invoice_number"),
                DB::raw('SUM(sales.total_amount) - COALESCE((SELECT SUM(amount) FROM customer_payments WHERE customer_payments.customer_id = sales.customer_id ), 0) as remaining_debt'),
                DB::raw('DATEDIFF(NOW(), MIN(sales.transaction_date)) as oldest_invoice_days'),
                DB::raw("CASE 
                WHEN DATEDIFF(NOW(), MIN(sales.transaction_date)) <= 14 THEN 'Monitor'
                ELSE 'High Risk'
            END as debt_status")
            )
            ->where('sales.status', 'unpaid')
            ->groupBy('sales.customer_id', 'customers.name')
            ->having('remaining_debt', '>', 0)
            ->having('oldest_invoice_days', '>=', 7)
            ->orderBy('oldest_invoice_days', 'DESC')
            ->limit(5)
            ->get();


        $chartData = [];

        if ($type === 'daily') {
            $salesTrend = DB::table('sales')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->selectRaw('WEEKDAY(transaction_date) as day_index, SUM(total_amount) as revenue')
                ->groupBy('day_index')
                ->get();

            $cashTrend = DB::table('customer_payments')
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->selectRaw('WEEKDAY(payment_date) as day_index, SUM(amount) as cash_in')
                ->groupBy('day_index')
                ->get();

            $daysInEnglish = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            foreach ($daysInEnglish as $index => $dayName) {
                $chartData[] = [
                    'label'   => $dayName,
                    'revenue' => (float) ($salesTrend->firstWhere('day_index', $index)->revenue ?? 0),
                    'cash'    => (float) ($cashTrend->firstWhere('day_index', $index)->cash_in ?? 0),
                ];
            }
        } elseif ($type === 'weekly') {
            $salesTrend = DB::table('sales')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->selectRaw('FLOOR((DAY(transaction_date) - 1) / 7) + 1 as week_index, SUM(total_amount) as revenue')
                ->groupBy('week_index')
                ->get();

            $cashTrend = DB::table('customer_payments')
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->selectRaw('FLOOR((DAY(payment_date) - 1) / 7) + 1 as week_index, SUM(amount) as cash_in')
                ->groupBy('week_index')
                ->get();

            for ($w = 1; $w <= 5; $w++) {
                $chartData[] = [
                    'label'   => 'Week ' . $w,
                    'revenue' => (float) ($salesTrend->firstWhere('week_index', $w)->revenue ?? 0),
                    'cash'    => (float) ($cashTrend->firstWhere('week_index', $w)->cash_in ?? 0),
                ];
            }
        } else {
            $salesTrend = DB::table('sales')
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->selectRaw('MONTH(transaction_date) as month_index, SUM(total_amount) as revenue')
                ->groupBy('month_index')
                ->get();

            $cashTrend = DB::table('customer_payments')
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->selectRaw('MONTH(payment_date) as month_index, SUM(amount) as cash_in')
                ->groupBy('month_index')
                ->get();

            $monthsInEnglish = [
                1 => 'January',
                2 => 'February',
                3 => 'March',
                4 => 'April',
                5 => 'May',
                6 => 'June',
                7 => 'July',
                8 => 'August',
                9 => 'September',
                10 => 'October',
                11 => 'November',
                12 => 'December'
            ];

            foreach ($monthsInEnglish as $monthNum => $monthName) {
                $chartData[] = [
                    'label'   => $monthName,
                    'revenue' => (float) ($salesTrend->firstWhere('month_index', $monthNum)->revenue ?? 0),
                    'cash'    => (float) ($cashTrend->firstWhere('month_index', $monthNum)->cash_in ?? 0),
                ];
            }
        }

        return response()->json([
            'status' => true,
            'data' => [
                'summary' => [
                    'total_orders'        => (int) ($salesData->total_orders ?? 0),
                    'gross_revenue'       => (float) ($salesData->gross_revenue ?? 0),
                    'total_cash_received' => $totalCashReceived,
                    'total_receivable'    => $totalReceivable,
                ],
                'alerts' => [
                    'zero_cogs_count' => $zeroCogsAlertCount,
                ],
                'top_products' => $topProducts,
                'aging_receivables' => $topAgingReceivables,
                'chart_data' => $chartData
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
