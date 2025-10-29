<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Role;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'owner', 'display_name' => 'Owner'],
            ['name' => 'backend', 'display_name' => 'Backend Developer'],
            ['name' => 'frontend', 'display_name' => 'Frontend Developer'],
            ['name' => 'qa', 'display_name' => 'QA'],
            ['name' => 'designer', 'display_name' => 'Designer'],
            ['name' => 'project_manager', 'display_name' => 'Project Manager'],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(
                ['name' => $roleData['name']],
                ['display_name' => $roleData['display_name']]
            );
        }

        $users = [
            [
                'name' => 'Ivan Ivanov',
                'email' => 'ivan@admin.local',
                'password' => Hash::make('password'),
                'role_name' => 'owner',
            ],
            [
                'name' => 'Elena Petrova',
                'email' => 'elena@frontend.local',
                'password' => Hash::make('password'),
                'role_name' => 'frontend',
            ],
            [
                'name' => 'Petar Georgiev',
                'email' => 'petar@backend.local',
                'password' => Hash::make('password'),
                'role_name' => 'backend',
            ],
        ];

        foreach ($users as $userData) {
            $role = Role::where('name', $userData['role_name'])->first();
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => $userData['password'],
                    'role_id' => $role->id,
                ]
            );
        }

        $categories = [
            ['name' => 'Development', 'slug' => 'development'],
            ['name' => 'Design', 'slug' => 'design'],
            ['name' => 'Project Management', 'slug' => 'project-management'],
            ['name' => 'AI & Machine Learning', 'slug' => 'ai-ml'],
            ['name' => 'Testing & QA', 'slug' => 'testing-qa'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                ['name' => $categoryData['name']]
            );
        }

        $aiCategory = Category::where('slug', 'ai-ml')->first();
        $owner = User::where('email', 'ivan@admin.local')->first();

        $sampleTools = [
            [
                'name' => 'ChatGPT',
                'description' => 'AI-powered conversational assistant for code, writing, and problem-solving',
                'url' => 'https://chat.openai.com',
                'category_id' => $aiCategory->id,
                'user_id' => $owner->id,
            ],
            [
                'name' => 'GitHub Copilot',
                'description' => 'AI pair programmer that suggests code completions',
                'url' => 'https://github.com/features/copilot',
                'category_id' => $aiCategory->id,
                'user_id' => $owner->id,
            ],
        ];

        foreach ($sampleTools as $toolData) {
            Tool::firstOrCreate(
                ['name' => $toolData['name']],
                $toolData
            );
        }
    }
}
