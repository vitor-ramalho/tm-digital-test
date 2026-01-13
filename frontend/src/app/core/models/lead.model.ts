/**
 * Lead Status Enum
 * Aligned with backend domain
 */
export enum LeadStatus {
  NEW = 'NEW',
  INITIAL_CONTACT = 'INITIAL_CONTACT',
  NEGOTIATION = 'NEGOTIATION',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

/**
 * Lead Model
 * Aligned with LeadResponseDto from backend
 */
export interface Lead {
  id: string;
  name: string;
  cpf: string;
  status: LeadStatus;
  municipality: string;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
  isHighPriority?: boolean;
  propertiesCount?: number;
}

/**
 * Create Lead DTO
 * Aligned with backend CreateLeadDto
 */
export interface CreateLeadDto {
  name: string;
  cpf: string;
  status?: LeadStatus;
  municipality: string;
  comments?: string;
}

/**
 * Update Lead DTO
 * Aligned with backend UpdateLeadDto
 */
export interface UpdateLeadDto {
  name?: string;
  cpf?: string;
  status?: LeadStatus;
  municipality?: string;
  comments?: string;
}

/**
 * Filter Leads DTO
 * For querying leads with filters
 */
export interface FilterLeadsDto {
  status?: LeadStatus;
  municipality?: string;
  isHighPriority?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Lead Statistics
 */
export interface LeadStatistics {
  totalLeads: number;
  statusCounts: { status: LeadStatus; count: number }[];
  municipalityCounts: { municipality: string; count: number }[];
}
