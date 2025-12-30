<?php
// app/Policies/HousePolicy.php

namespace App\Policies;

use App\Models\User;
use App\Models\House;

class HousePolicy
{
    /**
     * Determine if the user can view the house.
     */
    public function view(User $user, House $house)
    {
        return $user->id === $house->user_id;
    }

    /**
     * Determine if the user can update the house.
     */
    public function update(User $user, House $house)
    {
        return $user->id === $house->user_id;
    }

    /**
     * Determine if the user can delete the house.
     */
    public function delete(User $user, House $house)
    {
        return $user->id === $house->user_id;
    }
}