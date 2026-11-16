<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Technology extends Model
{
    protected $fillable = ['name', 'slug', 'category', 'icon', 'position', 'is_visible'];

    protected function casts(): array
    {
        return ['position' => 'integer', 'is_visible' => 'boolean'];
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class);
    }
}
