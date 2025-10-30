<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->string('link')->nullable()->after('name');
            $table->text('official_documentation')->nullable()->after('description');
            $table->text('how_to_use')->nullable()->after('official_documentation');
            $table->text('real_examples')->nullable()->after('how_to_use');
            $table->json('tags')->nullable()->after('real_examples');
            $table->json('images')->nullable()->after('tags');
        });
    }

    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn([
                'link',
                'official_documentation',
                'how_to_use',
                'real_examples',
                'tags',
                'images',
            ]);
        });
    }
};
