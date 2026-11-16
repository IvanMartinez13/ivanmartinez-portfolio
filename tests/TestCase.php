<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUpTraits(): array
    {
        $connection = config('database.default');
        $databaseConfig = config("database.connections.{$connection}");

        if (! app()->environment('testing') || ($databaseConfig['driver'] ?? null) !== 'pgsql' || ($databaseConfig['database'] ?? null) !== 'db_testing') {
            throw new \RuntimeException('Destructive tests are permitted only against the isolated PostgreSQL database [db_testing].');
        }

        return parent::setUpTraits();
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
