<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    public function index(Request $request)
    {
        $query = Tool::with(['categories', 'user', 'recommendedForRoles']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->has('role_id')) {
            $query->whereHas('recommendedForRoles', function ($q) use ($request) {
                $q->where('roles.id', $request->role_id);
            });
        }

        if ($request->has('tags')) {
            $tags = is_array($request->tags) ? $request->tags : [$request->tags];
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        $tools = $query->latest()->paginate(12);

        return response()->json($tools);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'link' => 'required|url',
            'description' => 'required|string',
            'official_documentation' => 'nullable|string',
            'how_to_use' => 'nullable|string',
            'real_examples' => 'nullable|string',
            'tags' => 'nullable|array',
            'images' => 'nullable|array',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $tool = $request->user()->tools()->create([
            'name' => $validated['name'],
            'link' => $validated['link'],
            'description' => $validated['description'],
            'official_documentation' => $validated['official_documentation'] ?? null,
            'how_to_use' => $validated['how_to_use'] ?? null,
            'real_examples' => $validated['real_examples'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'images' => $validated['images'] ?? null,
        ]);

        if (!empty($validated['category_ids'])) {
            $tool->categories()->sync($validated['category_ids']);
        }

        if (!empty($validated['role_ids'])) {
            $tool->recommendedForRoles()->sync($validated['role_ids']);
        }

        $tool->load(['categories', 'user', 'recommendedForRoles']);

        return response()->json([
            'tool' => $tool,
            'message' => 'Tool created successfully',
        ], 201);
    }

    public function show(Tool $tool)
    {
        $tool->load(['categories', 'user', 'recommendedForRoles']);

        return response()->json([
            'tool' => $tool,
        ]);
    }

    public function update(Request $request, Tool $tool)
    {
        $this->authorize('update', $tool);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'link' => 'sometimes|url',
            'description' => 'sometimes|string',
            'official_documentation' => 'nullable|string',
            'how_to_use' => 'nullable|string',
            'real_examples' => 'nullable|string',
            'tags' => 'nullable|array',
            'images' => 'nullable|array',
            'category_ids' => 'sometimes|array',
            'category_ids.*' => 'exists:categories,id',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $tool->update([
            'name' => $validated['name'] ?? $tool->name,
            'link' => $validated['link'] ?? $tool->link,
            'description' => $validated['description'] ?? $tool->description,
            'official_documentation' => $validated['official_documentation'] ?? $tool->official_documentation,
            'how_to_use' => $validated['how_to_use'] ?? $tool->how_to_use,
            'real_examples' => $validated['real_examples'] ?? $tool->real_examples,
            'tags' => $validated['tags'] ?? $tool->tags,
            'images' => $validated['images'] ?? $tool->images,
        ]);

        if (isset($validated['category_ids'])) {
            $tool->categories()->sync($validated['category_ids']);
        }

        if (isset($validated['role_ids'])) {
            $tool->recommendedForRoles()->sync($validated['role_ids']);
        }

        $tool->load(['categories', 'user', 'recommendedForRoles']);

        return response()->json([
            'tool' => $tool,
            'message' => 'Tool updated successfully',
        ]);
    }

    public function destroy(Tool $tool)
    {
        $this->authorize('delete', $tool);

        $tool->delete();

        return response()->json([
            'message' => 'Tool deleted successfully',
        ]);
    }
}
