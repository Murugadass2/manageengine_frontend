export type UserRole = 'SUPER_ADMIN' | 'HOTEL_MANAGER' | 'DEPT_MANAGER' | 'TECHNICIAN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeCode: string;
  phone?: string | null;
  status?: string;
  avatarUrl?: string | null;
  departmentId?: string | null;
  department?: Department | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: string;
  manager?: string | null;
  managerId?: string | null;
  managerEmail?: string | null;
  techniciansCount?: number;
  activeTicketsCount?: number;
}

export type TicketType = 'INCIDENT' | 'SERVICE_REQUEST' | 'MAINTENANCE_REQUEST' | 'IT_SUPPORT' | 'COMPLAINT' | 'GENERAL_REQUEST';
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 
  | 'NEW'
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'PENDING_EMPLOYEE'
  | 'PENDING_APPROVAL'
  | 'ON_HOLD'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'CANCELLED';

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  impact: string;
  urgency: string;
  status: TicketStatus;
  location?: string | null;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    email: string;
    employeeCode: string;
    phone?: string | null;
  };
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  assignedTechnicianId?: string | null;
  assignedTechnician?: {
    id: string;
    name: string;
    email: string;
    employeeCode: string;
    phone?: string | null;
  } | null;
  assetId?: string | null;
  asset?: {
    id: string;
    assetTag: string;
    name: string;
    category?: string;
  } | null;
  responseDueAt: string;
  resolutionDueAt: string;
  firstRespondedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  resolutionNotes?: string | null;
  rejectionReason?: string | null;
  satisfactionRating?: number | null;
  feedback?: string | null;
  remainingMs?: number;
  isBreached?: boolean;
  comments?: TicketComment[];
  workLogs?: TicketWorkLog[];
  history?: TicketHistoryItem[];
  attachments?: TicketAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  };
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketWorkLog {
  id: string;
  ticketId: string;
  technicianId: string;
  technician: {
    id: string;
    name: string;
    employeeCode: string;
  };
  hoursSpent: number;
  description: string;
  createdAt: string;
}

export interface TicketHistoryItem {
  id: string;
  ticketId: string;
  actorId?: string | null;
  actor?: {
    id: string;
    name: string;
    role: string;
  } | null;
  action: string;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  location?: string | null;
  status: string;
  cost?: number | null;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  assignedUserId?: string | null;
  assignedUser?: { id: string; name: string; employeeCode: string } | null;
  _count?: { tickets: number };
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  stockQuantity: number;
  minLevel: number;
  unit: string;
  unitPrice: number;
  location?: string | null;
  supplier?: string | null;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string | null;
  referenceTicketId?: string | null;
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentName: string;
  category: string;
  location: string;
  frequency: string;
  nextScheduledDate: string;
  lastCompletedDate?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  checklist?: { task: string; done: boolean }[];
  assignedTechnicianId?: string | null;
  assignedTechnician?: {
    id: string;
    name: string;
    employeeCode: string;
    email: string;
  } | null;
}

export interface Approval {
  id: string;
  requestNo: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  ticketId?: string | null;
  ticket?: { id: string; ticketNumber: string; subject: string } | null;
  requester: { id: string; name: string; employeeCode: string; email: string };
  approver?: { id: string; name: string; email: string } | null;
  reason?: string | null;
  createdAt: string;
  decidedAt?: string | null;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  viewsCount: number;
  helpfulCount: number;
  author?: { id: string; name: string; role: string } | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: { id: string; name: string; email: string; role: string } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details: string;
  ipAddress?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface SLAPolicy {
  id: string;
  name: string;
  priority: string;
  responseMinutes: number;
  resolutionMinutes: number;
  escalationRole: string;
  isActive: boolean;
}

export interface DashboardMetrics {
  summary: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    overdueTickets: number;
    criticalIncidents: number;
    slaCompliance: number;
  };
  departmentPerformance: {
    name: string;
    code: string;
    ticketCount: number;
    compliance: number;
  }[];
  ticketTrends: {
    period: string;
    total: number;
    resolved: number;
    sla: number;
  }[];
  priorityBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  technicianWorkload: {
    name: string;
    code: string;
    department: string;
    assignedCount: number;
  }[];
}
