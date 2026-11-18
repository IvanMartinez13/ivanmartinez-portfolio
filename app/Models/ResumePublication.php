<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResumePublication extends Model
{
    public $timestamps = false;

    protected $fillable = ['version', 'snapshot', 'published_by', 'created_at'];

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'version' => 'integer', 'created_at' => 'immutable_datetime'];
    }
}
