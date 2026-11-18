<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resume_experiences', function (Blueprint $table): void {
            $table->unsignedSmallInteger('started_year')->nullable()->after('ended_at');
            $table->unsignedSmallInteger('ended_year')->nullable()->after('started_year');
        });

        Schema::table('resume_education', function (Blueprint $table): void {
            $table->unsignedSmallInteger('started_year')->nullable()->after('ended_at');
            $table->unsignedSmallInteger('ended_year')->nullable()->after('started_year');
        });
    }

    public function down(): void
    {
        Schema::table('resume_experiences', function (Blueprint $table): void {
            $table->dropColumn(['started_year', 'ended_year']);
        });

        Schema::table('resume_education', function (Blueprint $table): void {
            $table->dropColumn(['started_year', 'ended_year']);
        });
    }
};
