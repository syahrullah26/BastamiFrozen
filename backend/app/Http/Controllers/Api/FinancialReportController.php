<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
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
            ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')
            ->join('product_units', 'sale_items.product_unit_id', '=', 'product_units.id')
            ->whereBetween('sales.transaction_date', [$startDate, $endDate])
            ->selectRaw('
            COUNT(DISTINCT sales.id) as total_orders,
            SUM(sale_items.subtotal) as gross_revenue,
            SUM((sale_items.quantity * product_units.conversion_factor) * sale_items.cost_price_at_sale) as total_cogs
        ')
            ->first();

        $totalOrders  = (int) ($financialData->total_orders ?? 0);
        $grossRevenue = (float) ($financialData->gross_revenue ?? 0);
        $totalCogs    = (float) ($financialData->total_cogs ?? 0);
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
