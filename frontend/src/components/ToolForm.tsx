'use client';

import { useState, useEffect } from 'react';
import { api, Category, Role, Tool } from '@/lib/api';

interface ToolFormProps {
  tool?: Tool;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ToolForm({ tool, onSuccess, onCancel }: ToolFormProps) {
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    link: tool?.link || '',
    description: tool?.description || '',
    official_documentation: tool?.official_documentation || '',
    how_to_use: tool?.how_to_use || '',
    real_examples: tool?.real_examples || '',
    tags: tool?.tags?.join(', ') || '',
    images: tool?.images?.join(', ') || '',
    category_ids: tool?.categories?.map(c => c.id) || [],
    role_ids: tool?.recommended_for_roles?.map(r => r.id) || [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, rolesRes] = await Promise.all([
        api.getCategories(),
        api.getRoles(),
      ]);
      setCategories(categoriesRes.categories);
      setRoles(rolesRes.roles);
    } catch {
      setError('Failed to load form data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        link: formData.link,
        description: formData.description,
        official_documentation: formData.official_documentation || undefined,
        how_to_use: formData.how_to_use || undefined,
        real_examples: formData.real_examples || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        images: formData.images ? formData.images.split(',').map(i => i.trim()).filter(Boolean) : undefined,
        category_ids: formData.category_ids,
        role_ids: formData.role_ids.length > 0 ? formData.role_ids : undefined,
      };

      if (tool) {
        await api.updateTool(tool.id, payload);
      } else {
        await api.createTool(payload);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tool');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await api.createCategory({ name: newCategoryName });
      setCategories([...categories, res.category]);
      setFormData({ ...formData, category_ids: [...formData.category_ids, res.category.id] });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const toggleCategory = (categoryId: number) => {
    setFormData({
      ...formData,
      category_ids: formData.category_ids.includes(categoryId)
        ? formData.category_ids.filter(id => id !== categoryId)
        : [...formData.category_ids, categoryId],
    });
  };

  const toggleRole = (roleId: number) => {
    setFormData({
      ...formData,
      role_ids: formData.role_ids.includes(roleId)
        ? formData.role_ids.filter(id => id !== roleId)
        : [...formData.role_ids, roleId],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          required
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.category_ids.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
        {!showNewCategory ? (
          <button
            type="button"
            onClick={() => setShowNewCategory(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            + Add new category
          </button>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewCategory(false)}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recommended for Roles
        </label>
        <div className="space-y-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.role_ids.includes(role.id)}
                onChange={() => toggleRole(role.id)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{role.display_name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Official Documentation
        </label>
        <textarea
          value={formData.official_documentation}
          onChange={(e) => setFormData({ ...formData, official_documentation: e.target.value })}
          rows={2}
          placeholder="Markdown or URL"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How to Use
        </label>
        <textarea
          value={formData.how_to_use}
          onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Real Examples
        </label>
        <textarea
          value={formData.real_examples}
          onChange={(e) => setFormData({ ...formData, real_examples: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="tag1, tag2, tag3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Comma-separated values</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images/Screenshots
        </label>
        <input
          type="text"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          placeholder="https://example.com/image1.png, https://example.com/image2.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Comma-separated URLs</p>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={loading || formData.category_ids.length === 0}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : tool ? 'Update Tool' : 'Create Tool'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
