<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SetCmsAdmin extends Command
{
    protected $signature = 'cms:admin {email : Email of an existing user} {--revoke : Remove administrative access}';

    protected $description = 'Grant or revoke CMS access for an existing user';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $this->error("No user exists with email [{$email}]. Create that account through the approved user-management process first.");

            return self::FAILURE;
        }

        $grantAccess = ! $this->option('revoke');

        if ($user->canAccessAdmin() === $grantAccess) {
            $this->info($grantAccess
                ? "[{$email}] already has CMS administrator access."
                : "[{$email}] already has no CMS administrator access.");

            return self::SUCCESS;
        }

        $user->forceFill(['is_admin' => $grantAccess])->save();

        $this->info($grantAccess
            ? "CMS administrator access granted to [{$email}]."
            : "CMS administrator access revoked for [{$email}].");

        return self::SUCCESS;
    }
}
