<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('books')->get()->map(function ($category) {
            // Map database fields to frontend expected fields
            return [
                'id' => $category->id,
                'category_code' => $category->category_code,
                'category_name' => $category->category_name,
                'name' => $category->category_name, // Frontend expects 'name'
                'description' => $category->category_name, // Use category_name as description for now
                'books_count' => $category->books_count,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];
        });
        
        return response()->json([
            'success' => true, 
            'message' => 'Categories retrieved successfully',
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:125',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false, 
                'message' => 'Validation errors',
                'data' => $validator->errors()
            ], 422);
        }

        $category = Category::create([
            'category_code' => 'CAT' . str_pad(Category::count() + 1, 3, '0', STR_PAD_LEFT),
            'category_name' => $request->name,
        ]);

        // Return mapped response
        $categoryResponse = [
            'id' => $category->id,
            'category_code' => $category->category_code,
            'category_name' => $category->category_name,
            'name' => $category->category_name,
            'description' => $category->category_name,
            'books_count' => 0,
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $categoryResponse
        ], 201);
    }

    public function show($id)
    {
        $category = Category::with('books')->find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }

        // Format response to match frontend expectations
        $categoryResponse = [
            'id' => $category->id,
            'name' => $category->category_name,
            'description' => $category->category_name,
            'books_count' => $category->books->count(),
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];

        return response()->json([
            'success' => true, 
            'data' => $categoryResponse
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'success' => false, 
                'message' => 'Category not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:125',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'data' => $validator->errors()
            ], 422);
        }

        $category->update([
            'category_name' => $request->name,
        ]);

        // Format response to match frontend expectations
        $categoryResponse = [
            'id' => $category->id,
            'name' => $category->category_name,
            'description' => $category->category_name,
            'books_count' => $category->books()->count(),
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $categoryResponse
        ]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json([
                'success' => false, 
                'message' => 'Category not found'
            ], 404);
        }

        $category->delete();
        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
}
