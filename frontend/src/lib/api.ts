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

export interface Tool {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  category_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  user?: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  tools_count?: number;
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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

  async getTools(): Promise<{ tools: Tool[] }> {
    return this.request<{ tools: Tool[] }>('/tools');
  }

  async createTool(data: {
    name: string;
    description?: string;
    url?: string;
    category_id: number;
  }): Promise<{ tool: Tool; message: string }> {
    return this.request<{ tool: Tool; message: string }>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request<{ categories: Category[] }>('/categories');
  }
}

export const api = new ApiClient();
