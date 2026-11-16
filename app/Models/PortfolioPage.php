<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PortfolioPage extends Model
{
    protected $fillable = [
        'key',
        'title',
        'slug',
        'status',
        'published_at',
        'draft_blocks',
        'published_blocks',
        'seo_title',
        'seo_description',
        'published_title',
        'published_slug',
        'published_seo_title',
        'published_seo_description',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'immutable_datetime',
            'draft_blocks' => 'array',
            'published_blocks' => 'array',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PortfolioSection::class)->orderBy('position');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(PortfolioPageRevision::class)->orderByDesc('version');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}
