<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResumeEducation extends Model
{
    protected $table = 'resume_education';

    protected $fillable = ['qualification', 'institution', 'started_at', 'ended_at', 'started_year', 'ended_year', 'description', 'sort_order', 'is_visible'];

    protected function casts(): array
    {
        return ['started_at' => 'immutable_date', 'ended_at' => 'immutable_date', 'started_year' => 'integer', 'ended_year' => 'integer', 'is_visible' => 'boolean', 'sort_order' => 'integer'];
    }
}
