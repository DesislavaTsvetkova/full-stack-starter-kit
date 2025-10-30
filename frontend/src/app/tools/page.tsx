'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Tool, Category, Role } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ToolForm from '@/components/ToolForm';
import Header from '@/components/Header';

export default function ToolsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedRole, setSelectedRole] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | undefined>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [toolsRes, categoriesRes, rolesRes] = await Promise.all([
        api.getTools({
          search: searchTerm || undefined,
          category_id: selectedCategory,
          role_id: selectedRole,
          page: currentPage,
        }),
        api.getCategories(),
        api.getRoles(),
      ]);

      setTools(toolsRes.data);
      setTotalPages(toolsRes.last_page);
      setCategories(categoriesRes.categories);
      setRoles(rolesRes.roles);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchTerm, selectedCategory, selectedRole, currentPage]);

  const handleDelete = async (toolId: number) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      await api.deleteTool(toolId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tool');
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTool(undefined);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTool(undefined);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {editingTool ? 'Edit Tool' : 'Add New Tool'}
          </h1>
          <div className="bg-white rounded-lg shadow p-6">
            <ToolForm
              tool={editingTool}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Tools Directory</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Tool
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={selectedRole || ''}
                onChange={(e) => {
                  setSelectedRole(e.target.value ? Number(e.target.value) : undefined);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading tools...</div>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No tools found</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              Add the first tool
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                  </div>

                  {tool.categories && tool.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tool.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {tool.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {tool.description}
                    </p>
                  )}

                  {tool.recommended_for_roles && tool.recommended_for_roles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Recommended for:</p>
                      <div className="flex flex-wrap gap-1">
                        {tool.recommended_for_roles.map((role) => (
                          <span
                            key={role.id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {role.display_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tool.tags && tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {tool.link && (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Visit Tool →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
