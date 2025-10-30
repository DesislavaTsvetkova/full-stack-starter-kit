'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, Tool, Category } from '@/lib/api';
import ToolForm from '@/components/ToolForm';
import Header from '@/components/Header';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTool, setShowAddTool] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    url: '',
    category_id: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [toolsData, categoriesData] = await Promise.all([
        api.getTools(),
        api.getCategories(),
      ]);
      setTools(toolsData.data);
      setCategories(categoriesData.categories);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout handled via shared Header

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTool({
        name: newTool.name,
        link: newTool.url,
        description: newTool.description,
        category_ids: [parseInt(newTool.category_id)],
      });
      setNewTool({ name: '', description: '', url: '', category_id: '' });
      setShowAddTool(false);
      loadData();
    } catch (error) {
      console.error('Failed to add tool:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-red-100 text-red-800',
      backend: 'bg-green-100 text-green-800',
      frontend: 'bg-blue-100 text-blue-800',
      qa: 'bg-yellow-100 text-yellow-800',
      designer: 'bg-pink-100 text-pink-800',
      project_manager: 'bg-indigo-100 text-indigo-800',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}!
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">You have the role:</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                user.role?.name || ''
              )}`}
            >
              {user.role?.display_name}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">AI Tools</h3>
            <button
              onClick={() => setShowAddTool(!showAddTool)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {showAddTool ? 'Cancel' : 'Add Tool'}
            </button>
          </div>

          {showAddTool && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Tool</h4>
              <ToolForm
                onSuccess={() => { setShowAddTool(false); loadData(); }}
                onCancel={() => setShowAddTool(false)}
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(!Array.isArray(tools) || tools.length === 0) ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No tools yet. Add your first tool!
              </div>
            ) : (
              tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
                    {tool.categories && tool.categories.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tool.categories[0].name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tool.description || 'No description'}
                  </p>
                  {tool.link && (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Visit Website →
                    </a>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    Added by {tool.user?.name || 'Unknown'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
