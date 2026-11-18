<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioAppearanceRevision extends Model
{
    protected $fillable = ['portfolio_appearance_id', 'version', 'preset', 'config', 'created_by'];

    protected function casts(): array
    {
        return ['config' => 'array', 'version' => 'integer'];
    }

    public function appearance(): BelongsTo
    {
        return $this->belongsTo(PortfolioAppearance::class);
    }
}
