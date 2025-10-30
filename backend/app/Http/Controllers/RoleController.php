<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::all();

        return response()->json([
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name|max:255',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $role = Role::create($validated);

        return response()->json([
            'role' => $role,
            'message' => 'Role created successfully',
        ], 201);
    }

    public function show(Role $role)
    {
        return response()->json([
            'role' => $role,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $role->id . '|max:255',
            'display_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $role->update($validated);

        return response()->json([
            'role' => $role,
            'message' => 'Role updated successfully',
        ]);
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully',
        ]);
    }
}
