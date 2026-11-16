<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProjectMedia extends Model
{
    protected $fillable = ['project_id', 'kind', 'storage_path', 'external_url', 'alt_text', 'caption', 'position', 'is_visible'];

    protected function casts(): array
    {
        return ['position' => 'integer', 'is_visible' => 'boolean'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getUrlAttribute(): ?string
    {
        return $this->storage_path ? Storage::disk('public')->url($this->storage_path) : $this->external_url;
    }
}
