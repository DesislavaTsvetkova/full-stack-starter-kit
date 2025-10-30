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
                [
                    'display_name' => $roleData['display_name'],
                    'description' => 'Role for ' . $roleData['display_name']
                ]
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
            ['name' => 'Development', 'slug' => 'development', 'description' => 'Development tools and IDEs'],
            ['name' => 'Design', 'slug' => 'design', 'description' => 'Design and prototyping tools'],
            ['name' => 'Project Management', 'slug' => 'project-management', 'description' => 'Project management and collaboration tools'],
            ['name' => 'AI & Machine Learning', 'slug' => 'ai-ml', 'description' => 'AI and ML powered tools'],
            ['name' => 'Testing & QA', 'slug' => 'testing-qa', 'description' => 'Testing and quality assurance tools'],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                [
                    'name' => $categoryData['name'],
                    'description' => $categoryData['description']
                ]
            );
        }

        $aiCategory = Category::where('slug', 'ai-ml')->first();
        $owner = User::where('email', 'ivan@admin.local')->first();

        $backendRole = Role::where('name', 'backend')->first();
        $frontendRole = Role::where('name', 'frontend')->first();
        $designerRole = Role::where('name', 'designer')->first();

        $sampleTools = [
            [
                'name' => 'ChatGPT',
                'link' => 'https://chat.openai.com',
                'description' => 'AI-powered conversational assistant for code, writing, and problem-solving',
                'official_documentation' => 'https://platform.openai.com/docs',
                'how_to_use' => 'Simply start a conversation and ask questions or request assistance with various tasks.',
                'tags' => ['ai', 'chatbot', 'productivity'],
                'user_id' => $owner->id,
                'categories' => [$aiCategory->id],
                'roles' => [$backendRole->id, $frontendRole->id],
            ],
            [
                'name' => 'GitHub Copilot',
                'link' => 'https://github.com/features/copilot',
                'description' => 'AI pair programmer that suggests code completions',
                'official_documentation' => 'https://docs.github.com/copilot',
                'how_to_use' => 'Install the extension in your IDE and start coding. Copilot will suggest completions as you type.',
                'tags' => ['ai', 'coding', 'ide'],
                'user_id' => $owner->id,
                'categories' => [$aiCategory->id],
                'roles' => [$backendRole->id, $frontendRole->id],
            ],
            [
                'name' => 'Midjourney',
                'link' => 'https://www.midjourney.com',
                'description' => 'AI art generator that creates images from text descriptions',
                'how_to_use' => 'Use Discord to interact with the Midjourney bot and generate images from text prompts.',
                'tags' => ['ai', 'design', 'art'],
                'user_id' => $owner->id,
                'categories' => [$aiCategory->id],
                'roles' => [$designerRole->id],
            ],
        ];

        foreach ($sampleTools as $toolData) {
            $tool = Tool::firstOrCreate(
                ['name' => $toolData['name']],
                [
                    'name' => $toolData['name'],
                    'link' => $toolData['link'],
                    'description' => $toolData['description'],
                    'official_documentation' => $toolData['official_documentation'] ?? null,
                    'how_to_use' => $toolData['how_to_use'] ?? null,
                    'tags' => $toolData['tags'] ?? null,
                    'user_id' => $toolData['user_id'],
                ]
            );

            if (isset($toolData['categories'])) {
                $tool->categories()->sync($toolData['categories']);
            }

            if (isset($toolData['roles'])) {
                $tool->recommendedForRoles()->sync($toolData['roles']);
            }
        }
    }
}
