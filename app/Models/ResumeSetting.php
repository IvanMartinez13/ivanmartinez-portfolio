<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResumeSetting extends Model
{
    protected $fillable = ['key', 'draft_config'];

    protected function casts(): array
    {
        return ['draft_config' => 'array'];
    }
}
