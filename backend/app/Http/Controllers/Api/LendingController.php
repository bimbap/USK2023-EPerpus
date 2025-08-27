<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lending;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class LendingController extends Controller
{
    public function index()
    {
        $lendings = Lending::with(['user', 'book'])->get();
        return response()->json(['success' => true, 'data' => $lendings]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'lend_date' => 'required|string',
            'book_condition_lent' => 'required|string|max:255',
        ]);

        $lending = new Lending();
        $lending->member_name = $request->user()->id; // otomatis ambil user yang login
        $lending->book_id = $request->book_id;
        $lending->lend_date = $request->lend_date;
        $lending->book_condition_lent = $request->book_condition_lent;
        $lending->save();

        return response()->json([
            'success' => true,
            'message' => 'Buku berhasil dipinjam!',
            'data' => $lending
        ]);
    }

    public function show($id)
    {
        $lending = Lending::with(['user', 'book'])->find($id);
        if (!$lending) {
            return response()->json(['success' => false, 'message' => 'Lending not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $lending]);
    }

    public function update(Request $request, $id)
    {
        $lending = Lending::find($id);
        if (!$lending) {
            return response()->json(['success' => false, 'message' => 'Lending not found'], 404);
        }

        // For returning books
        if ($request->has('return_date')) {
            $lending->update([
                'return_date' => $request->return_date,
                'book_condition_returned' => $request->book_condition_returned,
                'fine' => $request->fine ?? '0'
            ]);
        } else {
            $lending->update($request->all());
        }

        $lending->load(['user', 'book']);
        return response()->json(['success' => true, 'data' => $lending]);
    }

    public function destroy($id)
    {
        $lending = Lending::find($id);
        if (!$lending) {
            return response()->json(['success' => false, 'message' => 'Lending not found'], 404);
        }

        $lending->delete();
        return response()->json(['success' => true, 'message' => 'Lending deleted successfully']);
    }

    // User lihat history peminjaman
    public function history()
    {
        $userId = auth()->id();
        $data = Lending::with('book')->where('member_name', $userId)->get();
        return response()->json($data);
    }

    // Admin lihat semua peminjaman
    public function indexAdmin()
    {
        $data = Lending::with('book', 'user')->get();

        return response()->json([
            'status' => 200,
            'data' => $data,
        ]);
    }
}
