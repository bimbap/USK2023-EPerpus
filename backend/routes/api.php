<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\LendingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\IdentityController;
use App\Http\Controllers\Api\UserController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile Management Routes
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // User Management Routes
    Route::apiResource('users', UserController::class);
    Route::patch('/users/{id}/role', [UserController::class, 'updateRole']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
    
    Route::apiResource('books', BookController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('publishers', PublisherController::class);
    Route::apiResource('lendings', LendingController::class);
    Route::apiResource('messages', MessageController::class);
    Route::apiResource('notifications', NotificationController::class);
    
    // Additional routes for lending
    Route::get('/lendings/history', [LendingController::class, 'history']);
    Route::get('/admin/lendings', [LendingController::class, 'indexAdmin']);
    
    // Identity/Profile routes
    Route::get('/admin/identitas_app', [IdentityController::class, 'showIdentitas']);
    Route::post('/admin/identitas_app', [IdentityController::class, 'storeIdentitas']);
    Route::post('/admin/identitas_app/{id}', [IdentityController::class, 'updateIdentitas']);
});