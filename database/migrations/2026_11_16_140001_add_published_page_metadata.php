<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_pages', function (Blueprint $table): void {
            $table->string('published_title')->nullable();
            $table->string('published_slug')->nullable()->unique();
            $table->string('published_seo_title', 160)->nullable();
            $table->text('published_seo_description')->nullable();
        });

        DB::table('portfolio_pages')->where('status', 'published')->update([
            'published_title' => DB::raw('title'),
            'published_slug' => DB::raw('slug'),
            'published_seo_title' => DB::raw('seo_title'),
            'published_seo_description' => DB::raw('seo_description'),
        ]);
    }

    public function down(): void
    {
        Schema::table('portfolio_pages', function (Blueprint $table): void {
            $table->dropUnique(['published_slug']);
            $table->dropColumn(['published_title', 'published_slug', 'published_seo_title', 'published_seo_description']);
        });
    }
};
