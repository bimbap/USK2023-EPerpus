<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublisherController extends Controller
{
    public function index()
    {
        $publishers = Publisher::withCount('books')->get();
        
        // Format response to match frontend expectations
        $publishersResponse = $publishers->map(function ($publisher) {
            return [
                'id' => $publisher->id,
                'name' => $publisher->publisher_name, // Use publisher_name as name
                'address' => $publisher->address,
                'email' => $publisher->email,
                'phone' => $publisher->phone,
                'code' => $publisher->publisher_code,
                'verified' => $publisher->publisher_verified,
                'books_count' => $publisher->books_count,
                'created_at' => $publisher->created_at,
                'updated_at' => $publisher->updated_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Publishers retrieved successfully',
            'data' => $publishersResponse
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:125',
            'address' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'data' => $validator->errors()
            ], 422);
        }

        $publisher = Publisher::create([
            'publisher_code' => 'PUB' . str_pad(Publisher::count() + 1, 3, '0', STR_PAD_LEFT),
            'publisher_name' => $request->name,
            'address' => $request->address,
            'email' => $request->email,
            'phone' => $request->phone,
            'publisher_verified' => 'verified',
        ]);

        // Format response to match frontend expectations
        $publisherResponse = [
            'id' => $publisher->id,
            'name' => $publisher->publisher_name,
            'address' => $publisher->address,
            'email' => $publisher->email,
            'phone' => $publisher->phone,
            'code' => $publisher->publisher_code,
            'verified' => $publisher->publisher_verified,
            'books_count' => 0,
            'created_at' => $publisher->created_at,
            'updated_at' => $publisher->updated_at,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Publisher created successfully',
            'data' => $publisherResponse
        ], 201);
    }

    public function show($id)
    {
        $publisher = Publisher::with('books')->find($id);
        if (!$publisher) {
            return response()->json([
                'success' => false, 
                'message' => 'Publisher not found'
            ], 404);
        }

        // Format response to match frontend expectations
        $publisherResponse = [
            'id' => $publisher->id,
            'name' => $publisher->publisher_name,
            'address' => $publisher->address,
            'email' => $publisher->email,
            'phone' => $publisher->phone,
            'code' => $publisher->publisher_code,
            'verified' => $publisher->publisher_verified,
            'books_count' => $publisher->books->count(),
            'created_at' => $publisher->created_at,
            'updated_at' => $publisher->updated_at,
        ];

        return response()->json([
            'success' => true, 
            'data' => $publisherResponse
        ]);
    }

    public function update(Request $request, $id)
    {
        $publisher = Publisher::find($id);
        if (!$publisher) {
            return response()->json([
                'success' => false, 
                'message' => 'Publisher not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:125',
            'address' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'data' => $validator->errors()
            ], 422);
        }

        $publisher->update([
            'publisher_name' => $request->name,
            'address' => $request->address,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        // Format response to match frontend expectations
        $publisherResponse = [
            'id' => $publisher->id,
            'name' => $publisher->publisher_name,
            'address' => $publisher->address,
            'email' => $publisher->email,
            'phone' => $publisher->phone,
            'code' => $publisher->publisher_code,
            'verified' => $publisher->publisher_verified,
            'books_count' => $publisher->books()->count(),
            'created_at' => $publisher->created_at,
            'updated_at' => $publisher->updated_at,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Publisher updated successfully',
            'data' => $publisherResponse
        ]);
    }

    public function destroy($id)
    {
        $publisher = Publisher::find($id);
        if (!$publisher) {
            return response()->json([
                'success' => false, 
                'message' => 'Publisher not found'
            ], 404);
        }

        $publisher->delete();
        return response()->json([
            'success' => true,
            'message' => 'Publisher deleted successfully'
        ]);
    }
}
