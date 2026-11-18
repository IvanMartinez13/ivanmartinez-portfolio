<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAssetReference extends Model
{
    protected $fillable = ['media_asset_id', 'portfolio_page_id', 'portfolio_page_revision_id', 'scope'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'media_asset_id');
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(PortfolioPage::class, 'portfolio_page_id');
    }
}
