<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::create([
            'user_code' => 'USR000001',
            'student_id' => 'ADMIN001',
            'fullname' => 'Administrator',
            'username' => 'admin',
            'email' => 'admin@library.com',
            'password' => Hash::make('password'),
            'class' => 'XII',
            'jurusan' => 'RPL',
            'phone_number' => '081234567890',
            'verified' => 'verified',
            'role' => 'admin',
            'join_date' => now()->format('Y-m-d H:i:s'),
            'last_login' => now()->format('Y-m-d H:i:s'),
        ]);

        // Create librarian user
        User::create([
            'user_code' => 'USR000002',
            'student_id' => 'LIB001',
            'fullname' => 'Pustakawan',
            'username' => 'librarian',
            'email' => 'librarian@library.com',
            'password' => Hash::make('password'),
            'class' => 'XII',
            'jurusan' => 'RPL',
            'phone_number' => '081234567891',
            'verified' => 'verified',
            'role' => 'librarian',
            'join_date' => now()->format('Y-m-d H:i:s'),
            'last_login' => now()->format('Y-m-d H:i:s'),
        ]);

        // Create student user (ibrahim)
        User::create([
            'user_code' => 'USR000003',
            'student_id' => 'STD001',
            'fullname' => 'Ibrahim',
            'username' => 'ibrahim',
            'email' => 'ibrahim@student.com',
            'password' => Hash::make('password'),
            'class' => 'XII',
            'jurusan' => 'RPL',
            'phone_number' => '081234567892',
            'verified' => 'verified',
            'role' => 'siswa',
            'join_date' => now()->format('Y-m-d H:i:s'),
            'last_login' => now()->format('Y-m-d H:i:s'),
        ]);
    }
}
