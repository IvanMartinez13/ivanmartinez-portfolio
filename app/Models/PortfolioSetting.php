<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioSetting extends Model
{
    protected $fillable = [
        'key',
        'site_title',
        'default_meta_description',
        'locale',
        'timezone',
        'footer_note',
    ];
}
