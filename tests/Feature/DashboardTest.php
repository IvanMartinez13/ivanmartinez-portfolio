<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_route_has_been_removed()
    {
        $this->get('/dashboard')->assertNotFound();
        $this->actingAs(User::factory()->create())->get('/dashboard')->assertNotFound();
    }
}
