<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MediaLibraryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MediaAsset::query()->withCount('references')->orderByDesc('created_at');
        if ($term = trim((string) $request->query('q', ''))) {
            $query->where(function ($builder) use ($term): void {
                $builder->where('original_name', 'ilike', '%'.$term.'%')->orWhere('alt_text', 'ilike', '%'.$term.'%');
            });
        }

        return Inertia::render('admin/media/index', ['assets' => $query->paginate(24)->withQueryString()->through(fn (MediaAsset $asset): array => $this->serialize($asset))]);
    }

    public function library(Request $request): JsonResponse
    {
        $query = MediaAsset::query()->withCount('references')->orderByDesc('created_at');
        if ($term = trim((string) $request->query('q', ''))) {
            $query->where(fn ($builder) => $builder->where('original_name', 'ilike', '%'.$term.'%')->orWhere('alt_text', 'ilike', '%'.$term.'%'));
        }

        return response()->json(['assets' => $query->limit(60)->get()->map(fn (MediaAsset $asset): array => $this->serialize($asset))]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'], 'alt_text' => ['nullable', 'string', 'max:500']]);
        $file = $request->file('image');
        $path = $file->storeAs('media', Str::uuid().'.'.$file->extension(), 'public');
        abort_unless($path, 500, 'No se ha podido guardar la imagen.');

        $asset = MediaAsset::query()->create([
            'public_id' => (string) Str::uuid(), 'disk' => 'public', 'path' => $path,
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream', 'size' => $file->getSize(),
            'alt_text' => $validated['alt_text'] ?? '',
        ]);

        return response()->json(['asset' => $this->serialize($asset)], 201);
    }

    public function update(Request $request, MediaAsset $asset): JsonResponse
    {
        $asset->update($request->validate(['alt_text' => ['required', 'string', 'max:500']]));

        return response()->json(['asset' => $this->serialize($asset->fresh())]);
    }

    public function destroy(MediaAsset $asset): JsonResponse
    {
        $path = DB::transaction(function () use ($asset): ?array {
            $locked = MediaAsset::query()->lockForUpdate()->findOrFail($asset->id);
            if ($locked->references()->exists()) {
                return null;
            }
            $disk = $locked->disk;
            $path = $locked->path;
            $locked->delete();

            return [$disk, $path];
        });
        if ($path === null) {
            return response()->json(['message' => 'No se puede eliminar: la imagen está usada en un borrador, una página publicada o una revisión conservada.'], 409);
        }
        [$disk, $storedPath] = $path;
        Storage::disk($disk)->delete($storedPath);

        return response()->json(['message' => 'Imagen eliminada.']);
    }

    public function show(Request $request, string $publicId)
    {
        $asset = MediaAsset::query()->where('public_id', $publicId)->firstOrFail();
        $isAdmin = $request->user()?->can('access-admin') === true;
        if (! $isAdmin) {
            $isPublic = $asset->references()->where('scope', 'published')->with('page')->get()->contains(fn ($reference): bool => $reference->page?->status === 'published' && $this->isVisibleInBlocks($reference->page->published_blocks ?? [], $asset->id)
            );
            abort_unless($isPublic, 404);
        }

        abort_unless(Storage::disk($asset->disk)->exists($asset->path), 404);

        return Storage::disk($asset->disk)->response($asset->path, $asset->original_name, [
            'Content-Type' => $asset->mime_type, 'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => $isAdmin ? 'private, no-store' : 'public, max-age=86400',
        ]);
    }

    /** @return array<string, mixed> */
    private function serialize(MediaAsset $asset): array
    {
        return ['id' => $asset->id, 'public_id' => $asset->public_id, 'url' => $asset->url, 'original_name' => $asset->original_name,
            'mime_type' => $asset->mime_type, 'size' => $asset->size, 'alt_text' => $asset->alt_text, 'created_at' => $asset->created_at?->toIso8601String(),
            'references' => $asset->references_count ?? $asset->references()->count()];
    }

    /** @param array<mixed> $blocks */
    private function isVisibleInBlocks(array $blocks, int $assetId): bool
    {
        foreach ($blocks as $block) {
            if (! is_array($block) || ! ($block['visible'] ?? true)) {
                continue;
            }
            if ($this->containsAssetId($block['content'] ?? [], $assetId)) {
                return true;
            }
        }

        return false;
    }

    /** @param array<mixed> $value */
    private function containsAssetId(array $value, int $assetId): bool
    {
        foreach ($value as $key => $item) {
            if ($key === 'asset_id' && ($item === $assetId || (is_string($item) && ctype_digit($item) && (int) $item === $assetId))) {
                return true;
            }
            if (is_array($item) && $this->containsAssetId($item, $assetId)) {
                return true;
            }
        }

        return false;
    }
}
