<?php

namespace App\Policies;

use App\Models\Technology;
use App\Models\User;

class TechnologyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessAdmin();
    }

    public function create(User $user): bool
    {
        return $user->canAccessAdmin();
    }

    public function update(User $user, Technology $technology): bool
    {
        return $user->canAccessAdmin();
    }

    public function delete(User $user, Technology $technology): bool
    {
        return $user->canAccessAdmin();
    }
}
