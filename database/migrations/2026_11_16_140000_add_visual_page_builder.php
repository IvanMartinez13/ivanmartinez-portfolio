<?php

use App\Models\PortfolioPage;
use App\Models\PortfolioPageRevision;
use App\Models\PortfolioSection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_pages', function (Blueprint $table): void {
            $table->jsonb('draft_blocks')->nullable();
            $table->jsonb('published_blocks')->nullable();
            $table->string('seo_title', 160)->nullable();
            $table->text('seo_description')->nullable();
        });

        Schema::create('portfolio_page_revisions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('portfolio_page_id')->constrained('portfolio_pages')->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('title');
            $table->string('slug');
            $table->string('seo_title', 160)->nullable();
            $table->text('seo_description')->nullable();
            $table->jsonb('blocks');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['portfolio_page_id', 'version']);
        });

        // Copy the legacy homepage section content exactly once. Do not update rows
        // that have already acquired builder data (for example after a manual run).
        PortfolioPage::query()->each(function (PortfolioPage $page): void {
            if ($page->draft_blocks !== null || $page->published_blocks !== null) {
                return;
            }

            $blocks = PortfolioSection::query()
                ->where('portfolio_page_id', $page->id)
                ->orderBy('position')
                ->get()
                ->map(fn (PortfolioSection $section): array => [
                    'id' => (string) Str::uuid(),
                    'type' => match ($section->key) {
                        'projects' => 'featured_projects',
                        'experience' => 'timeline',
                        'about' => 'profile',
                        'stack' => 'technologies',
                        'contact' => 'cta',
                        default => $section->key === 'hero' ? 'hero' : 'rich_text',
                    },
                    'position' => $section->position,
                    'visible' => $section->is_visible,
                    'variant' => $section->variant,
                    'spacing' => 'default',
                    'nav_label' => $section->nav_label,
                    'content' => ['legacy_key' => $section->key] + ($section->content ?? []),
                ])->values()->all();

            $page->draft_blocks = $blocks;
            if ($page->status === 'published') {
                $page->published_blocks = $blocks;
            }
            $page->save();
            if ($page->status === 'published') {
                PortfolioPageRevision::query()->firstOrCreate(
                    ['portfolio_page_id' => $page->id, 'version' => 1],
                    ['title' => $page->title, 'slug' => $page->slug, 'seo_title' => $page->seo_title, 'seo_description' => $page->seo_description, 'blocks' => $blocks],
                );
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_page_revisions');
        Schema::table('portfolio_pages', function (Blueprint $table): void {
            $table->dropColumn(['draft_blocks', 'published_blocks', 'seo_title', 'seo_description']);
        });
    }
};
