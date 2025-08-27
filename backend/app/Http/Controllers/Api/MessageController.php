<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::with(['senderUser', 'receiverUser'])->get();
        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'receiver' => 'required|exists:users,id',
            'sender' => 'required|exists:users,id',
            'message_title' => 'required|string|max:50',
            'message_content' => 'required|string',
            'status' => 'required|string|max:50',
            'send_date' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $message = Message::create($request->all());
        $message->load(['senderUser', 'receiverUser']);
        return response()->json(['success' => true, 'data' => $message], 201);
    }

    public function show($id)
    {
        $message = Message::with(['senderUser', 'receiverUser'])->find($id);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Message not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $message]);
    }

    public function update(Request $request, $id)
    {
        $message = Message::find($id);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Message not found'], 404);
        }

        $message->update($request->all());
        $message->load(['senderUser', 'receiverUser']);
        return response()->json(['success' => true, 'data' => $message]);
    }

    public function destroy($id)
    {
        $message = Message::find($id);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Message not found'], 404);
        }

        $message->delete();
        return response()->json(['success' => true, 'message' => 'Message deleted successfully']);
    }
}
