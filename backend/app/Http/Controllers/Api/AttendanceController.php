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
            $attendances = $query->latest('attendace_date')->paginate(15);
            return response()->json([
                'status'  => true,
                'message' => 'Attendance list retrieved successfully',
                'data'    => AttendanceResource::collection($attendances)->response()->getData(true),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Attendance index error: ' . $e->getMessage());
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
            $employee = Employee::findOrFail($attendance->employee_id);

            $validated = $request->validate([
                'attendace_date' => 'required|date',
                'status'         => 'required|in:present,absent,leave,leave_with_permission',
                'notes'          => 'nullable|string',
            ]);
            if ($validated['attendace_date'] !== $attendance->attendace_date) {
                $alreadyExists = Attendance::where('employee_id', $attendance->employee_id)
                    ->where('attendace_date', $validated['attendace_date'])
                    ->where('id', '!=', $id)
                    ->exists();

                if ($alreadyExists) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Validation Error',
                        'errors'  => ['attendace_date' => ['Karyawan sudah memiliki riwayat absensi di tanggal baru ini.']]
                    ], 422);
                }
            }
            DB::transaction(function () use ($attendance, $employee, $validated) {
                $attendance->update([
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
}
