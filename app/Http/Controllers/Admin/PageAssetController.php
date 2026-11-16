<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadPageAssetRequest;
use App\Models\PortfolioPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PageAssetController extends Controller
{
    public function store(UploadPageAssetRequest $request, PortfolioPage $page): JsonResponse
    {
        $filename = Str::uuid().'.'.$request->file('image')->extension();
        $path = $request->file('image')->storeAs(
            'pages/'.$page->id,
            $filename,
            'local',
        );
        abort_unless($path, 500, 'No se ha podido guardar la imagen.');
        $url = route('pages.assets.show', ['page' => $page, 'filename' => $filename]);

        return response()->json(['url' => $url]);
    }

    public function show(Request $request, PortfolioPage $page, string $filename)
    {
        abort_unless(preg_match('/^[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp)$/i', $filename) === 1, 404);
        $path = 'pages/'.$page->id.'/'.$filename;
        abort_unless(Storage::disk('local')->exists($path), 404);

        $isAdmin = $request->user()?->can('view', $page) === true;
        if (! $isAdmin) {
            $url = route('pages.assets.show', ['page' => $page, 'filename' => $filename]);
            abort_unless($page->status === 'published' && $this->containsUrl($page->published_blocks ?? [], $url), 404);
        }

        $absolutePath = Storage::disk('local')->path($path);

        return response()->file($absolutePath, [
            'Content-Type' => mime_content_type($absolutePath) ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => $isAdmin ? 'private, no-store' : 'public, max-age=86400',
        ]);
    }

    /** @param array<mixed> $value */
    private function containsUrl(array $value, string $url): bool
    {
        foreach ($value as $item) {
            if ($item === $url) {
                return true;
            }
            if (is_array($item) && ($item['visible'] ?? true) && $this->containsUrl($item, $url)) {
                return true;
            }
        }

        return false;
    }
}
