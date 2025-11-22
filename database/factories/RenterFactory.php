<?php

namespace Database\Factories;

use App\Models\Renter;
use Illuminate\Database\Eloquent\Factories\Factory;

class RenterFactory extends Factory
{
    protected $model = Renter::class;

    public function definition()
    {
        return [
            'name' => fake()->name(),
            'phone' => fake()->numerify('0##########'), // Tạo số điện thoại dạng 0xxxxxxxxx
            'email' => fake()->unique()->safeEmail(),
            'id_number' => fake()->numerify('0##########'), // CCCD 10 số
            'address' => fake()->address(),
        ];
    }
}