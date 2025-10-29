<?php

namespace App\Http\Controllers;

use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('tools')->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }
}
