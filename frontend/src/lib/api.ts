const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
    display_name: string;
  } | null;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  tools_count?: number;
}

export interface Tool {
  id: number;
  name: string;
  link?: string | null;
  description: string | null;
  official_documentation?: string | null;
  how_to_use?: string | null;
  real_examples?: string | null;
  tags?: string[] | null;
  images?: string[] | null;
  url: string | null;
  category_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  recommended_for_roles?: Role[];
  user?: User;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    await this.request('/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/me');
  }

  async getTools(params?: {
    search?: string;
    category_id?: number;
    role_id?: number;
    tags?: string[];
    page?: number;
  }): Promise<{
    data: Tool[];
    current_page: number;
    last_page: number;
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category_id) searchParams.append('category_id', params.category_id.toString());
    if (params?.role_id) searchParams.append('role_id', params.role_id.toString());
    if (params?.tags) params.tags.forEach(tag => searchParams.append('tags[]', tag));
    if (params?.page) searchParams.append('page', params.page.toString());

    return this.request(`/tools?${searchParams.toString()}`);
  }

  async getTool(id: number): Promise<{ tool: Tool }> {
    return this.request<{ tool: Tool }>(`/tools/${id}`);
  }

  async createTool(data: {
    name: string;
    link: string;
    description: string;
    official_documentation?: string;
    how_to_use?: string;
    real_examples?: string;
    tags?: string[];
    images?: string[];
    category_ids: number[];
    role_ids?: number[];
  }): Promise<{ tool: Tool; message: string }> {
    return this.request<{ tool: Tool; message: string }>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTool(id: number, data: {
    name?: string;
    link?: string;
    description?: string;
    official_documentation?: string;
    how_to_use?: string;
    real_examples?: string;
    tags?: string[];
    images?: string[];
    category_ids?: number[];
    role_ids?: number[];
  }): Promise<{ tool: Tool; message: string }> {
    return this.request<{ tool: Tool; message: string }>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTool(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tools/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request<{ categories: Category[] }>('/categories');
  }

  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<{ category: Category; message: string }> {
    return this.request<{ category: Category; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoles(): Promise<{ roles: Role[] }> {
    return this.request<{ roles: Role[] }>('/roles');
  }
}

export const api = new ApiClient();
