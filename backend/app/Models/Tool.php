<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'link',
        'description',
        'official_documentation',
        'how_to_use',
        'real_examples',
        'tags',
        'images',
        'url',
        'category_id',
        'user_id',
    ];

    protected $casts = [
        'tags' => 'array',
        'images' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recommendedForRoles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_tool_recommendations');
    }
}
