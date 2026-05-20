<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'employee_id'    => $this->employee_id,
            'attendace_date' => $this->attendace_date,
            'status'         => $this->status,
            'notes'          => $this->notes,
            'employee' => $this->whenLoaded('employee', function () {
                return [
                    'id'     => $this->employee->id,
                    'name'   => $this->employee->name,
                    'salary' => $this->employee->salary,
                ];
            }),
            'expense' => $this->whenLoaded('expense', function () {
                if (!$this->expense) return null;

                return [
                    'id'           => $this->expense->id,
                    'type'         => $this->expense->type,
                    'amount'       => $this->expense->amount,
                    'expense_date' => $this->expense->expense_date,
                    'notes'        => $this->expense->notes,
                ];
            }),
        ];
    }
}
