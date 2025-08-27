<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Identity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IdentityController extends Controller
{
    public function showIdentitas()
    {
        $data = Identity::all();

        return response()->json([
            'status' => 200,
            'message' => $data,
        ]);
    }

    public function storeIdentitas(Request $request)
    {
        $val = Validator::make($request->all(), [
            'app_name' => "required",
            'app_address' => "required", 
            'app_email' => "required",
            'app_phone' => "required",
        ]);

        if ($val->fails()) {
            return response()->json([
                'status' => 403,
                'errors' => $val->errors(),
            ]);
        }
        
        $data = Identity::create([
            'app_name' => $request->app_name,
            'app_address' => $request->app_address,
            'app_email' => $request->app_email,
            'app_phone' => $request->app_phone,
        ]);

        return response()->json([
            'status' => 200,
            'data' => $data,
        ]);
    }

    public function updateIdentitas($id, Request $request){
        $ident = Identity::where("id", $id)->first();

        if(!$ident){
            return response()->json([
                'status' => 404,
                'message' => "data not found",
            ]);
        }

        $data = $ident->update($request->all());

        return response()->json([
            'status' => 200,
            'data' => $data,
        ]);
    }
}
