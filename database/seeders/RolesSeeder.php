<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        $roles = ['Tecnico','Botanico','Coordinador','Admin'];
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }

        // Usuario admin
        $user = User::firstOrCreate(
            ['email' => 'admin@ifn.test'],
            ['name' => 'Admin IFN', 'password' => Hash::make('password123')]
        );

        $user->syncRoles(['Admin']);
    }
}
