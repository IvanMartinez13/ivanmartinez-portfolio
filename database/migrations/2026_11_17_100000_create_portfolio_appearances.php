<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_appearances', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 40)->unique();
            $table->jsonb('draft_config');
            $table->jsonb('published_config');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('portfolio_appearance_revisions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('portfolio_appearance_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('preset', 80);
            $table->jsonb('config');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['portfolio_appearance_id', 'version']);
        });

        $default = [
            'preset' => 'editorial-premium',
            'colors' => [
                'navy' => '#101C31', 'primary' => '#2459E0', 'secondary' => '#17B6A4',
                'background' => '#EFF3F9', 'surface' => '#FFFFFF', 'text' => '#101828',
                'muted' => '#526079', 'accent' => '#17B6A4', 'tint' => '#E2E9F4', 'line' => '#D7DFEA',
            ],
            'fontFamily' => 'Geist', 'typeScale' => 'expressive', 'radius' => 'soft', 'shadow' => 'editorial',
            'container' => 'wide', 'buttonStyle' => 'solid', 'spacing' => 'generous', 'motion' => 'subtle',
            'headerVariant' => 'editorial', 'footerVariant' => 'editorial',
        ];

        DB::table('portfolio_appearances')->insert([
            'key' => 'primary', 'draft_config' => json_encode($default), 'published_config' => json_encode($default),
            'published_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_appearance_revisions');
        Schema::dropIfExists('portfolio_appearances');
    }
};
