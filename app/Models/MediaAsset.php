<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MediaAsset extends Model
{
    protected $fillable = ['public_id', 'disk', 'path', 'original_name', 'mime_type', 'size', 'alt_text'];

    protected function casts(): array
    {
        return ['size' => 'integer'];
    }

    public function references(): HasMany
    {
        return $this->hasMany(MediaAssetReference::class);
    }

    public function getUrlAttribute(): string
    {
        return route('media.show', $this->public_id);
    }
}
