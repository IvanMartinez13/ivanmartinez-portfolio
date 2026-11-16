<?php

namespace App\Policies;

use App\Models\PortfolioPage;
use App\Models\User;

class PortfolioPagePolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_admin ? null : false;
    }

    public function viewAny(User $user): bool
    {
        return $user->is_admin;
    }

    public function view(User $user, PortfolioPage $page): bool
    {
        return $user->is_admin;
    }

    public function create(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user, PortfolioPage $page): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user, PortfolioPage $page): bool
    {
        return $user->is_admin && $page->key !== 'home';
    }

    public function publish(User $user, PortfolioPage $page): bool
    {
        return $user->is_admin;
    }
}
