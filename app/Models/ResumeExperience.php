<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ResumeExperience extends Model
{
    protected $fillable = ['job_title', 'company', 'location', 'started_at', 'ended_at', 'started_year', 'ended_year', 'is_current', 'description', 'responsibilities', 'achievements', 'sort_order', 'is_visible'];

    protected function casts(): array
    {
        return ['started_at' => 'immutable_date', 'ended_at' => 'immutable_date', 'started_year' => 'integer', 'ended_year' => 'integer', 'is_current' => 'boolean', 'is_visible' => 'boolean', 'responsibilities' => 'array', 'achievements' => 'array', 'sort_order' => 'integer'];
    }

    public function technologies(): BelongsToMany
    {
        return $this->belongsToMany(Technology::class, 'resume_experience_technology')->orderBy('technologies.position');
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'resume_experience_project')->orderBy('projects.sort_order');
    }
}
