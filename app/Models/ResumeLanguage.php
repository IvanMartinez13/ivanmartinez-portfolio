<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResumeLanguage extends Model
{
    protected $fillable = ['language', 'declared_level', 'certification_name', 'certification_url', 'sort_order', 'is_visible'];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean', 'sort_order' => 'integer'];
    }
}
