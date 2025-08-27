<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    use HasFactory;

    protected $fillable = [
        'publisher_code',
        'publisher_name',
        'name',
        'address',
        'email',
        'phone',
        'publisher_verified',
    ];

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
