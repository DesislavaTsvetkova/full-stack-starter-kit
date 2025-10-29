<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    public function index(Request $request)
    {
        $query = Tool::with(['category', 'user', 'recommendedForRoles']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('role_id')) {
            $query->whereHas('recommendedForRoles', function ($q) use ($request) {
                $q->where('role_id', $request->role_id);
            });
        }

        $tools = $query->latest()->get();

        return response()->json([
            'tools' => $tools,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'nullable|url',
            'category_id' => 'required|exists:categories,id',
        ]);

        $tool = $request->user()->tools()->create($validated);
        $tool->load(['category', 'user']);

        return response()->json([
            'tool' => $tool,
            'message' => 'Tool created successfully',
        ], 201);
    }

    public function show(Tool $tool)
    {
        $tool->load(['category', 'user', 'recommendedForRoles']);

        return response()->json([
            'tool' => $tool,
        ]);
    }

    public function update(Request $request, Tool $tool)
    {
        $this->authorize('update', $tool);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'url' => 'nullable|url',
            'category_id' => 'sometimes|exists:categories,id',
        ]);

        $tool->update($validated);
        $tool->load(['category', 'user']);

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
