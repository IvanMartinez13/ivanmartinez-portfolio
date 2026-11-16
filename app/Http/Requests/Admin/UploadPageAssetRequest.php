<?php

namespace App\Http\Requests\Admin;

use App\Models\PortfolioPage;
use Illuminate\Foundation\Http\FormRequest;

class UploadPageAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        $page = $this->route('page');

        return $page instanceof PortfolioPage && $this->user()?->can('update', $page) === true;
    }

    public function rules(): array
    {
        return ['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192']];
    }
}
