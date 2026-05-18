<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@bastami.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);
        User::factory()->create([
            'name' => 'Employee',
            'username' => 'employee',
            'email' => 'employee@bastami.com',
            'password' => 'password123',
            'role' => 'employee',
        ]);
    }
}
