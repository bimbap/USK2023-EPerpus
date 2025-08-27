<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category_id',
        'publisher_id',
        'author',
        'year_published',
        'isbn',
        'good_condition',
        'damaged_condition',
    ];

    // Add accessor untuk frontend compatibility
    public function getJudulBukuAttribute()
    {
        return $this->title;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }

    public function lendings()
    {
        return $this->hasMany(Lending::class);
    }

    public function getTotalCopiesAttribute()
    {
        return (int)$this->good_condition + (int)$this->damaged_condition;
    }

    public function getAvailableCopiesAttribute()
    {
        $borrowed = $this->lendings()->whereNull('return_date')->count();
        return $this->good_condition - $borrowed;
    }
}
