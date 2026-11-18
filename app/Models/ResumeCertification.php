<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResumeCertification extends Model
{
    protected $fillable = ['name', 'issuer', 'issued_at', 'credential_url', 'sort_order', 'is_visible'];

    protected function casts(): array
    {
        return ['issued_at' => 'immutable_date', 'is_visible' => 'boolean', 'sort_order' => 'integer'];
    }
}
