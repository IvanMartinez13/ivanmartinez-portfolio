<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioSection extends Model
{
    protected $fillable = [
        'portfolio_page_id',
        'key',
        'type',
        'nav_label',
        'position',
        'is_visible',
        'variant',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_visible' => 'boolean',
            'content' => 'array',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(PortfolioPage::class, 'portfolio_page_id');
    }
}
