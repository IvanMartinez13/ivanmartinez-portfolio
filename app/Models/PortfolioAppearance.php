<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PortfolioAppearance extends Model
{
    protected $fillable = ['key', 'draft_config', 'published_config', 'published_at', 'updated_by'];

    protected function casts(): array
    {
        return ['draft_config' => 'array', 'published_config' => 'array', 'published_at' => 'immutable_datetime'];
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(PortfolioAppearanceRevision::class)->orderByDesc('version');
    }
}
