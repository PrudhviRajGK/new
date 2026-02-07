// Entity Types
export interface Tenant {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'manager' | 'agent';
  status: 'active' | 'inactive';
  permissions: {
    leads: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    conversations: { view: boolean; reply: boolean };
    workflows: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    analytics: { view: boolean };
    settings: { view: boolean; edit: boolean };
  };
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
}

export interface Lead {
  id: string;
  tenant_id: string;
  whatsapp_number: string;
  name: string | null;
  email: string | null;
  company: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  qualification_status: 'not_started' | 'in_progress' | 'qualified' | 'unqualified';
  lead_score: number;
  stage_id: string | null;
  assigned_to: string | null;
  source: string | null;
  tags: string[];
  bant: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
  ai_summary: string | null;
  ai_next_action: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  stage?: LeadStage;
  assignedUser?: User;
}

export interface LeadStage {
  id: string;
  tenant_id: string;
  name: string;
  order: number;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  trigger_type: 'message_received' | 'no_reply' | 'stage_change' | 'qualification_complete' | 'manual' | 'scheduled';
  trigger_config: Record<string, any>;
  conditions: any[];
  actions: any[];
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  execution_count: number;
  success_count: number;
  failure_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  _id: string;
  tenant_id: string;
  lead_id: string;
  whatsapp_number: string;
  status: 'active' | 'closed';
  messages: Message[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  media_url: string | null;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  metadata: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  activeConversations: number;
  workflowExecutions: number;
  activeWorkflows: number;
  averageLeadScore: string;
  conversionRate: string;
}

// Form Types
export interface CreateLeadInput {
  whatsappNumber: string;
  name?: string;
  email?: string;
  company?: string;
  source?: string;
  tags?: string[];
}

export interface UpdateLeadInput {
  name?: string;
  email?: string;
  company?: string;
  status?: Lead['status'];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SendMessageInput {
  content: string;
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  trigger_type: Workflow['trigger_type'];
  trigger_config?: Record<string, any>;
  conditions?: any[];
  actions?: any[];
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  tenantId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  tenantId: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}
