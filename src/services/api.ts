const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('hdd_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('hdd_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('hdd_token');
};

// Generic fetch wrapper with auth header
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Authentication APIs
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<any>('/auth/me'),
  switchRole: (role: string) =>
    request<{ token: string; user: any }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
};

// Tickets APIs
export const ticketsApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<{ tickets: any[]; total: number; page: number; totalPages: number }>(`/tickets?${query.toString()}`);
  },
  getById: (id: string) => request<any>(`/tickets/${id}`),
  create: (data: any) =>
    request<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStatus: (id: string, status: string, remarks?: string) =>
    request<any>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    }),
  handleAssignment: (id: string, action: 'ACCEPT' | 'REJECT', reason?: string) =>
    request<any>(`/tickets/${id}/assignment-response`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    }),
  assign: (id: string, technicianId: string, reason?: string) =>
    request<any>(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId, reason }),
    }),
  addComment: (id: string, content: string, isInternal: boolean = false) =>
    request<any>(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isInternal }),
    }),
  addWorkLog: (id: string, hoursSpent: number, description: string) =>
    request<any>(`/tickets/${id}/work-logs`, {
      method: 'POST',
      body: JSON.stringify({ hoursSpent, description }),
    }),
  close: (id: string, satisfactionRating: number, feedback?: string) =>
    request<any>(`/tickets/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ satisfactionRating, feedback }),
    }),
};

// Department APIs
export const departmentsApi = {
  getAll: () => request<any[]>('/departments'),
  create: (data: any) =>
    request<any>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getTechnicians: (departmentId: string) =>
    request<any[]>(`/departments/${departmentId}/technicians`),
};

// Assets APIs
export const assetsApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/assets?${query}`);
  },
  create: (data: any) =>
    request<any>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Inventory APIs
export const inventoryApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/inventory?${query}`);
  },
  create: (data: any) =>
    request<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adjustStock: (id: string, data: { type: 'STOCK_IN' | 'STOCK_OUT'; quantity: number; notes?: string; referenceTicketId?: string }) =>
    request<any>(`/inventory/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Maintenance APIs
export const maintenanceApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/maintenance?${query}`);
  },
  create: (data: any) =>
    request<any>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTask: (id: string, data: { status?: string; checklist?: any[] }) =>
    request<any>(`/maintenance/${id}/task`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  convertToTicket: (id: string) =>
    request<any>(`/maintenance/${id}/convert-ticket`, {
      method: 'POST',
    }),
};

// Approvals APIs
export const approvalsApi = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<any[]>(`/approvals${query}`);
  },
  create: (data: any) =>
    request<any>('/approvals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  process: (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) =>
    request<any>(`/approvals/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    }),
};

// Knowledge Base APIs
export const kbApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/kb?${query}`);
  },
  getBySlug: (slug: string) => request<any>(`/kb/${slug}`),
  rateHelpful: (id: string) =>
    request<any>(`/kb/${id}/rate`, {
      method: 'POST',
    }),
  create: (data: any) =>
    request<any>('/kb', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Reports APIs
export const reportsApi = {
  getDashboard: () => request<any>('/reports/dashboard'),
  exportTicketsUrl: () => `${API_BASE}/reports/export/tickets`,
};

// Audit Logs APIs
export const auditApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ logs: any[]; total: number }>(`/audit?${query}`);
  },
};

// Notifications APIs
export const notificationsApi = {
  getAll: () => request<{ notifications: any[]; unreadCount: number }>('/notifications'),
  markAsRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllAsRead: () =>
    request<any>('/notifications/read-all', {
      method: 'POST',
    }),
};

// Users APIs
export const usersApi = {
  getAll: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/users?${query}`);
  },
  createUser: (data: {
    name: string;
    email: string;
    employeeCode: string;
    role: string;
    departmentId?: string;
    phone?: string;
    password?: string;
  }) =>
    request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProfile: (data: any) =>
    request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// SLA Policies APIs
export const slaApi = {
  getAll: () => request<any[]>('/sla'),
  update: (id: string, data: any) =>
    request<any>(`/sla/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
