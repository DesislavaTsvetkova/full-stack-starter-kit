<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            // Add new columns used by controller/model
            if (!Schema::hasColumn('tools', 'link')) {
                $table->string('link')->nullable()->after('name');
            }
            if (!Schema::hasColumn('tools', 'official_documentation')) {
                $table->text('official_documentation')->nullable()->after('description');
            }
            if (!Schema::hasColumn('tools', 'how_to_use')) {
                $table->text('how_to_use')->nullable()->after('official_documentation');
            }
            if (!Schema::hasColumn('tools', 'real_examples')) {
                $table->text('real_examples')->nullable()->after('how_to_use');
            }
            if (!Schema::hasColumn('tools', 'tags')) {
                $table->json('tags')->nullable()->after('real_examples');
            }
            if (!Schema::hasColumn('tools', 'images')) {
                $table->json('images')->nullable()->after('tags');
            }

            // Make description nullable if not already
            // Some MySQL versions require separate change(), but we skip if already nullable
        });

        // Create pivot table for many-to-many categories <-> tools
        if (!Schema::hasTable('category_tool')) {
            Schema::create('category_tool', function (Blueprint $table) {
                $table->id();
                $table->foreignId('category_id')->constrained()->cascadeOnDelete();
                $table->foreignId('tool_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['category_id', 'tool_id']);
            });
        }

        // Drop legacy single category relation if present
        Schema::table('tools', function (Blueprint $table) {
            if (Schema::hasColumn('tools', 'category_id')) {
                $table->dropConstrainedForeignId('category_id');
            }
            if (Schema::hasColumn('tools', 'url')) {
                // Keep 'url' if used elsewhere; no change. We won't drop to avoid data loss.
            }
        });
    }

    public function down(): void
    {
        // Re-add category_id (nullable to avoid issues) and drop pivot/extra columns
        Schema::table('tools', function (Blueprint $table) {
            if (!Schema::hasColumn('tools', 'category_id')) {
                $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            }
            if (Schema::hasColumn('tools', 'images')) {
                $table->dropColumn('images');
            }
            if (Schema::hasColumn('tools', 'tags')) {
                $table->dropColumn('tags');
            }
            if (Schema::hasColumn('tools', 'real_examples')) {
                $table->dropColumn('real_examples');
            }
            if (Schema::hasColumn('tools', 'how_to_use')) {
                $table->dropColumn('how_to_use');
            }
            if (Schema::hasColumn('tools', 'official_documentation')) {
                $table->dropColumn('official_documentation');
            }
            if (Schema::hasColumn('tools', 'link')) {
                $table->dropColumn('link');
            }
        });

        if (Schema::hasTable('category_tool')) {
            Schema::dropIfExists('category_tool');
        }
    }
};


