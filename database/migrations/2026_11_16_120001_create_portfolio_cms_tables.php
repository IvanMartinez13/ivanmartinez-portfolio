<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_pages', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('status', 20)->default('draft')->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portfolio_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_page_id')->constrained('portfolio_pages')->cascadeOnDelete();
            $table->string('key', 80);
            $table->string('type', 80);
            $table->string('nav_label', 80)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->string('variant', 80)->default('default');
            $table->jsonb('content');
            $table->timestamps();

            $table->unique(['portfolio_page_id', 'key']);
            $table->index(['portfolio_page_id', 'is_visible', 'position']);
        });

        Schema::create('professional_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('public_name', 160);
            $table->string('headline', 160);
            $table->string('specialty', 200);
            $table->string('short_description', 500);
            $table->text('biography');
            $table->string('location', 160)->nullable();
            $table->string('availability_label', 160);
            $table->decimal('experience_years', 4, 1)->nullable();
            $table->jsonb('links')->default('{}');
            $table->string('contact_email')->nullable();
            $table->string('photo_url', 2048)->nullable();
            $table->timestamps();
        });

        Schema::create('portfolio_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('site_title', 160);
            $table->text('default_meta_description');
            $table->string('locale', 12)->default('es');
            $table->string('timezone', 80)->default('Europe/Madrid');
            $table->string('footer_note', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_settings');
        Schema::dropIfExists('professional_profiles');
        Schema::dropIfExists('portfolio_sections');
        Schema::dropIfExists('portfolio_pages');
    }
};
