<?php

namespace App\Http\Controllers;

use App\Models\ResumePublication;
use App\Services\Portfolio\BuildPublicPortfolio;
use App\Services\Resume\BuildResume;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;

class PublicResumePdfController extends Controller
{
    public function __invoke(string $variant, BuildResume $resume): HttpResponse
    {
        abort_unless(in_array($variant, ['professional', 'ats'], true), 404);
        $publication = ResumePublication::query()->orderByDesc('version')->firstOrFail();
        $data = $resume->publicData($publication->snapshot, false);
        $data['generatedAt'] = $publication->created_at?->format('d/m/Y');
        $data['variant'] = $variant;
        $data['profile']['photo_data'] = $variant === 'professional' ? $this->localPhoto($data['profile']['photo_url'] ?? null) : null;
        $data['appearance'] = app(BuildPublicPortfolio::class)->chrome()['appearance'];

        $pdf = Pdf::loadView('pdf.resume', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isRemoteEnabled' => false,
                'isPhpEnabled' => false,
                'isJavascriptEnabled' => false,
                'defaultFont' => 'DejaVu Sans',
            ]);

        $pdf->render();
        $pdf->getDomPDF()->getCanvas()->page_text(505, 820, '{PAGE_NUM} / {PAGE_COUNT}', null, 8, [0.35, 0.39, 0.45]);

        return $pdf->download('ivan-martinez-cv-'.$variant.'.pdf');
    }

    private function localPhoto(?string $url): ?string
    {
        if (! $url) {
            return null;
        }
        $path = parse_url($url, PHP_URL_PATH);
        $configuredHost = parse_url((string) config('app.url'), PHP_URL_HOST);
        $imageHost = parse_url($url, PHP_URL_HOST);
        if (! is_string($path) || ($imageHost && $imageHost !== $configuredHost) || ! str_starts_with($path, '/storage/')) {
            return null;
        }
        $storagePath = substr($path, strlen('/storage/'));
        $disk = Storage::disk('public');
        if (! $disk->exists($storagePath)) {
            return null;
        }
        $mime = $disk->mimeType($storagePath);
        if (! in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            return null;
        }

        return 'data:'.$mime.';base64,'.base64_encode($disk->get($storagePath));
    }
}
