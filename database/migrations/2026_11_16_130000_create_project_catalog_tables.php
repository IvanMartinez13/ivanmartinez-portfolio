<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technologies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->string('category', 100);
            $table->string('icon', 120)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->index(['is_visible', 'category', 'position']);
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 180);
            $table->string('slug', 200)->unique();
            $table->string('summary', 500);
            $table->text('description')->nullable();
            $table->string('category', 100);
            $table->string('project_type', 100);
            $table->string('role', 180);
            $table->string('client_company', 180)->nullable();
            $table->date('started_at')->nullable();
            $table->date('completed_at')->nullable();
            $table->string('development_status', 30)->default('planning')->index();
            $table->string('publication_status', 20)->default('draft')->index();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_visible')->default(true)->index();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('main_image_path', 500)->nullable();
            $table->string('main_image_alt', 200)->nullable();
            $table->string('public_url', 2048)->nullable();
            $table->string('repository_url', 2048)->nullable();
            $table->string('seo_title', 180)->nullable();
            $table->string('seo_description', 250)->nullable();
            $table->timestamps();
            $table->index(['publication_status', 'is_visible', 'is_featured', 'sort_order']);
        });

        Schema::create('project_technology', function (Blueprint $table) {
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technology_id')->constrained()->cascadeOnDelete();
            $table->primary(['project_id', 'technology_id']);
        });

        Schema::create('project_case_study_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('key', 40);
            $table->string('title', 180);
            $table->text('body')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_visible')->default(false);
            $table->timestamps();
            $table->unique(['project_id', 'key']);
            $table->index(['project_id', 'is_visible', 'position']);
        });

        Schema::create('project_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 20);
            $table->string('storage_path', 500)->nullable();
            $table->string('external_url', 2048)->nullable();
            $table->string('alt_text', 200)->nullable();
            $table->string('caption', 250)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
            $table->index(['project_id', 'kind', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_media');
        Schema::dropIfExists('project_case_study_sections');
        Schema::dropIfExists('project_technology');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('technologies');
    }
};
