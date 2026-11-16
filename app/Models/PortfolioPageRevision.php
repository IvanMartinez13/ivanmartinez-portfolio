<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioPageRevision extends Model
{
    protected $fillable = ['portfolio_page_id', 'version', 'title', 'slug', 'seo_title', 'seo_description', 'blocks', 'created_by'];

    protected function casts(): array
    {
        return ['blocks' => 'array', 'version' => 'integer'];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(PortfolioPage::class, 'portfolio_page_id');
    }
}
