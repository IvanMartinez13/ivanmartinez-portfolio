<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resume_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 40)->unique();
            $table->jsonb('draft_config');
            $table->timestamps();
        });

        Schema::create('resume_experiences', function (Blueprint $table): void {
            $table->id();
            $table->string('job_title', 180);
            $table->string('company', 180);
            $table->string('location', 160)->nullable();
            $table->date('started_at')->nullable();
            $table->date('ended_at')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->jsonb('responsibilities')->default('[]');
            $table->jsonb('achievements')->default('[]');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->index(['is_visible', 'sort_order']);
        });

        Schema::create('resume_experience_technology', function (Blueprint $table): void {
            $table->foreignId('resume_experience_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technology_id')->constrained()->cascadeOnDelete();
            $table->primary(['resume_experience_id', 'technology_id']);
        });

        Schema::create('resume_experience_project', function (Blueprint $table): void {
            $table->foreignId('resume_experience_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->primary(['resume_experience_id', 'project_id']);
        });

        Schema::create('resume_education', function (Blueprint $table): void {
            $table->id();
            $table->string('qualification', 200);
            $table->string('institution', 180);
            $table->date('started_at')->nullable();
            $table->date('ended_at')->nullable();
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('resume_certifications', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 200);
            $table->string('issuer', 180);
            $table->date('issued_at')->nullable();
            $table->string('credential_url', 2048)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('resume_languages', function (Blueprint $table): void {
            $table->id();
            $table->string('language', 100);
            $table->string('declared_level', 100);
            $table->string('certification_name', 180)->nullable();
            $table->string('certification_url', 2048)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('resume_publications', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('version');
            $table->jsonb('snapshot');
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique('version');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resume_publications');
        Schema::dropIfExists('resume_languages');
        Schema::dropIfExists('resume_certifications');
        Schema::dropIfExists('resume_education');
        Schema::dropIfExists('resume_experience_project');
        Schema::dropIfExists('resume_experience_technology');
        Schema::dropIfExists('resume_experiences');
        Schema::dropIfExists('resume_settings');
    }
};
