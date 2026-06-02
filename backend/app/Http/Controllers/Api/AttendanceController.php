<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\AttendanceResource;
use Illuminate\Http\JsonResponse;
use App\Models\Employee;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;


class AttendanceController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Attendance::with(['employee', 'expense']);
            if ($request->has('date')) {
                $query->where('attendace_date', $request->date);
            }
            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }
            $startDate = Carbon::now()->startOfMonth()->toDateString();
            $endDate = Carbon::now()->endOfMonth()->toDateString();

            $monthlyQuery = $query->whereBetween('attendace_date', [$startDate, $endDate]);
            $totalPresent = $monthlyQuery->clone()->where('status', 'present')->count();
            $totalAbsent  = $monthlyQuery->clone()->where('status', 'absent')->count();
            $totalLeave   = $monthlyQuery->clone()->whereIn('status', ['leave', 'leave_with_permission'])->count();
            $totalSalaryExpense = $monthlyQuery->clone()
                ->where('attendances.status', 'present')
                ->join('employees', 'attendances.employee_id', '=', 'employees.id')
                ->sum('employees.salary');

            $attendances = $query->latest('attendace_date')->paginate(15);
            return response()->json([
                'status'  => true,
                'message' => 'Attendance list retrieved successfully',
                'data'    => AttendanceResource::collection($attendances)->additional([
                    'meta' => [
                        'stats' => [
                            'total_present' => $totalPresent,
                            'total_absent' => $totalAbsent,
                            'total_leave' => $totalLeave,
                            'total_salary_expense' => $totalSalaryExpense,
                        ]
                    ]
                ])->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Attendance index error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    public function getOptions(): JsonResponse
    {
        try {
            $attendances = Attendance::with('employee')->latest()->get();
            return response()->json([
                'status'  => true,
                'message' => 'Attendance options retrieved successfully',
                'data'    => AttendanceResource::collection($attendances),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Attendance options error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'employee_id'    => 'required|exists:employees,id',
                'attendace_date' => 'required|date',
                'status'         => 'required|in:present,absent,leave,leave_with_permission',
                'notes'          => 'nullable|string',
            ]);
            $alreadyExists = Attendance::where('employee_id', $validated['employee_id'])
                ->where('attendace_date', $validated['attendace_date'])
                ->exists();

            if ($alreadyExists) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation Error',
                    'errors'  => ['attendace_date' => ['Karyawan ini sudah memiliki riwayat absensi pada tanggal tersebut.']]
                ], 422);
            }

            $employee = Employee::findOrFail($validated['employee_id']);

            $attendance = DB::transaction(function () use ($employee, $validated) {

                $attendance = Attendance::create([
                    'employee_id'    => $employee->id,
                    'attendace_date' => $validated['attendace_date'],
                    'status'         => $validated['status'],
                    'notes'          => $validated['notes'],
                ]);
                if ($validated['status'] === 'present') {
                    $attendance->expense()->create([
                        'type'                => 'salary',
                        'amount'              => $employee->salary,
                        'expense_date'        => $validated['attendace_date'],
                        'notes'               => "Gaji harian atas kehadiran tanggal " . $validated['attendace_date'] . " atas nama " . $employee->name,
                        'supplier_payment_id' => null
                    ]);
                }

                return $attendance;
            });
            $attendance->load(['employee', 'expense']);

            return response()->json([
                'status'  => true,
                'message' => 'Attendance Created Successfully',
                'data'    => new AttendanceResource($attendance),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Attendance store error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $attendance = Attendance::findOrFail($id);
            $validated = $request->validate([
                'employee_id'    => 'required|exists:employees,id',
                'attendace_date' => 'required|date',
                'status'         => 'required|in:present,absent,leave,leave_with_permission',
                'notes'          => 'nullable|string',
            ]);

            $employee = Employee::findOrFail($validated['employee_id']);
            if ($validated['attendace_date'] !== $attendance->attendace_date || $validated['employee_id'] !== $attendance->employee_id) {
                $alreadyExists = Attendance::where('employee_id', $validated['employee_id'])
                    ->where('attendace_date', $validated['attendace_date'])
                    ->where('id', '!=', $id)
                    ->exists();

                if ($alreadyExists) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Validation Error',
                        'errors'  => ['attendace_date' => ['Karyawan ini sudah memiliki riwayat absensi di tanggal tersebut.']]
                    ], 422);
                }
            }

            DB::transaction(function () use ($attendance, $employee, $validated) {
                $attendance->update([
                    'employee_id'    => $validated['employee_id'],
                    'attendace_date' => $validated['attendace_date'],
                    'status'         => $validated['status'],
                    'notes'          => $validated['notes'],
                ]);
                if ($validated['status'] === 'present') {
                    $attendance->expense()->updateOrCreate(
                        ['attendance_id' => $attendance->id],
                        [
                            'type'                => 'salary',
                            'amount'              => $employee->salary,
                            'expense_date'        => $validated['attendace_date'],
                            'notes'               => "Penyesuaian gaji harian atas kehadiran tanggal " . $validated['attendace_date'] . " atas nama " . $employee->name,
                            'supplier_payment_id' => null
                        ]
                    );
                } else {
                    $attendance->expense()->delete();
                }
            });


            $attendance->load(['employee', 'expense']);

            return response()->json([
                'status'  => true,
                'message' => 'Attendance Updated Successfully',
                'data'    => new AttendanceResource($attendance),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Attendance update error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $attendance = Attendance::with(['employee', 'expense'])->findOrFail($id);
            return response()->json([
                'status'  => true,
                'message' => 'Attendance retrieved successfully',
                'data'    => new AttendanceResource($attendance),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Attendance show error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $attendance = Attendance::findOrFail($id);
            $attendance->delete();
            return response()->json([
                'status'  => true,
                'message' => 'Attendance deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Attendance destroy error: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Internal Server Error',
            ], 500);
        }
    }
}
