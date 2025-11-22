<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\House;




class HouseController extends Controller
{
    public function index()
    {
        $houses = Auth::user()->houses()->latest()->get();
        
        return Inertia::render('Landlord/Houses/Index', [
            'houses' => $houses,
        ]);
    }
    public function show($id)
    {
        $house = auth()->user()->houses()->findOrFail($id);

        return Inertia::render('Landlord/Houses/Show', [
            'house' => $house,
        ]);
    }

    public function create()
    {
        return Inertia::render('Landlord/Houses/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        Auth::user()->houses()->create($request->only(['name', 'address','description']));

        return redirect()->route('landlord.houses.index')->with('success', 'Tạo nhà trọ thành công!');
    }

    public function edit(House $house)
    {
        return Inertia::render('Landlord/Houses/Edit', [
            'house' => $house
        ]);
    }

    public function update(Request $request, House $house)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $house->update($request->only(['name', 'address']));

        return redirect()->route('landlord.houses.index')->with('success', 'Cập nhật thành công!');
    }

    public function destroy(House $house)
    {
        $house->delete();
        return redirect()->back()->with('success', 'Xóa nhà trọ thành công!');
    }
}