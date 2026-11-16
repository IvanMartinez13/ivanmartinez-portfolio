<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_media', function (Blueprint $table) {
            $table->boolean('is_visible')->default(true)->after('position');
            $table->index(['project_id', 'is_visible', 'position']);
        });
    }

    public function down(): void
    {
        Schema::table('project_media', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'is_visible', 'position']);
            $table->dropColumn('is_visible');
        });
    }
};
