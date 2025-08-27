<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lending extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_name',
        'book_id',
        'lend_date',
        'return_date',
        'book_condition_lent',
        'book_condition_returned',
        'fine',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'member_name');
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function isOverdue()
    {
        if (!$this->return_date && $this->lend_date) {
            $lendDate = \Carbon\Carbon::parse($this->lend_date);
            $dueDate = $lendDate->addDays(14); // 14 hari peminjaman
            return now()->greaterThan($dueDate);
        }
        return false;
    }
}
