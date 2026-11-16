<?php

namespace Tests\Feature;

use Database\Seeders\PortfolioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_a_successful_response()
    {
        $this->seed(PortfolioSeeder::class);
        $response = $this->get(route('home'));

        $response->assertOk();
    }
}
