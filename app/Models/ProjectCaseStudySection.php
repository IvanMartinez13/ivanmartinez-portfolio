<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectCaseStudySection extends Model
{
    protected $fillable = ['project_id', 'key', 'title', 'body', 'position', 'is_visible'];

    protected function casts(): array
    {
        return ['position' => 'integer', 'is_visible' => 'boolean'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
