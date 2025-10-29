<?php

namespace App\Providers;

use App\Models\Tool;
use App\Policies\ToolPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Tool::class, ToolPolicy::class);
    }
}
