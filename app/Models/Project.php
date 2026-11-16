<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Project extends Model
{
    protected $fillable = [
        'name', 'slug', 'summary', 'description', 'category', 'project_type', 'role',
        'client_company', 'started_at', 'completed_at', 'development_status',
        'publication_status', 'published_at', 'is_featured', 'is_visible', 'sort_order',
        'main_image_path', 'main_image_alt', 'public_url', 'repository_url', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'immutable_date',
            'completed_at' => 'immutable_date',
            'published_at' => 'immutable_datetime',
            'is_featured' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('publication_status', 'published')->where('is_visible', true);
    }

    public function technologies(): BelongsToMany
    {
        return $this->belongsToMany(Technology::class)->orderBy('technologies.position');
    }

    public function caseStudySections(): HasMany
    {
        return $this->hasMany(ProjectCaseStudySection::class)->orderBy('position');
    }

    public function media(): HasMany
    {
        return $this->hasMany(ProjectMedia::class)->orderBy('position');
    }

    public function getMainImageUrlAttribute(): ?string
    {
        return $this->main_image_path ? Storage::disk('public')->url($this->main_image_path) : null;
    }
}
