<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email'=>'admin@ifn.gov.co'],
            ['name'=>'Admin IFN','role'=>'Administrador','password'=>Hash::make('Admin123*'),'active'=>true]
        );
        User::updateOrCreate(
            ['email'=>'coordinador@ifn.gov.co'],
            ['name'=>'Coordinador IFN','role'=>'Coordinador','password'=>Hash::make('Coord123*'),'active'=>true]
        );
        User::updateOrCreate(
            ['email'=>'tecnico@ifn.gov.co'],
            ['name'=>'Tecnico IFN','role'=>'Tecnico','password'=>Hash::make('Tecnico123*'),'active'=>true]
        );
        User::updateOrCreate(
            ['email'=>'botanico@ifn.gov.co'],
            ['name'=>'Botanico IFN','role'=>'Botanico','password'=>Hash::make('Botanico123*'),'active'=>true]
        );
    }
}
