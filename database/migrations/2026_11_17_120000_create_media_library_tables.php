<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table): void {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('original_name');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size');
            $table->string('alt_text', 500)->default('');
            $table->timestamps();
            $table->index('original_name');
        });

        Schema::create('media_asset_references', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('media_asset_id')->constrained()->cascadeOnDelete();
            $table->foreignId('portfolio_page_id')->constrained()->cascadeOnDelete();
            $table->foreignId('portfolio_page_revision_id')->nullable()->constrained('portfolio_page_revisions')->cascadeOnDelete();
            $table->string('scope', 16);
            $table->timestamps();
            $table->index(['media_asset_id', 'scope']);
            $table->index(['portfolio_page_id', 'scope']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_asset_references');
        Schema::dropIfExists('media_assets');
    }
};
