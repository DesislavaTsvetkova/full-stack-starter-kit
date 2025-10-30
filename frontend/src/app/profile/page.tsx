"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, Tool } from '@/lib/api';
import ToolForm from '@/components/ToolForm';
import Header from '@/components/Header';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const toolsRes = await api.getTools();
      if (user) {
        setTools(toolsRes.data.filter((tool) => tool.user_id === user.id));
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleDelete = async (toolId: number) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    try {
      await api.deleteTool(toolId);
      setTools((prev) => prev.filter((tool) => tool.id !== toolId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tool');
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
  };

  const handleFormSuccess = () => {
    setEditingTool(null);
    loadData();
  };

  const handleFormCancel = () => {
    setEditingTool(null);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Welcome, {user.name} ({user.role?.display_name || user.role?.name || "User"})!
        </h2>
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Your Tools</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}
          {editingTool ? (
            <ToolForm
              tool={editingTool}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            (!tools || tools.length === 0 ? (
              <div className="text-gray-500 py-12 text-center">You haven’t added any tools yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-lg shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
                        {tool.categories && tool.categories.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tool.categories[0]?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
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
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
                        onClick={() => handleEdit(tool)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md font-medium hover:bg-red-200 transition"
                        onClick={() => handleDelete(tool.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
