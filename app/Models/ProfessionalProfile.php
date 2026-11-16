<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfessionalProfile extends Model
{
    protected $fillable = [
        'key',
        'public_name',
        'headline',
        'specialty',
        'short_description',
        'biography',
        'location',
        'availability_label',
        'experience_years',
        'links',
        'contact_email',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'decimal:1',
            'links' => 'array',
        ];
    }
}
