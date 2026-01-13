import { LeadStatus } from './lead.model';
import { CropType } from './rural-property.model';

/**
 * Complete Dashboard Response
 * Aligned with backend /api/dashboard response
 */
export interface DashboardResponse {
  leads: LeadStatistics;
  properties: PropertyStatistics;
  insights: DashboardInsights;
}

/**
 * Lead Statistics for Dashboard
 */
export interface LeadStatistics {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byMunicipality: Record<string, number>;
  highPriority: number;
}

/**
 * Property Statistics for Dashboard
 */
export interface PropertyStatistics {
  total: number;
  totalArea: number;
  averageArea: number;
  byCropType: Record<CropType, number>;
  highPriorityCount: number;
}

/**
 * Dashboard Insights
 */
export interface DashboardInsights {
  topMunicipality: {
    name: string;
    count: number;
  };
  conversionRate: number;
  averagePropertiesPerLead: number;
}

/**
 * Lead by Status Count
 */
export interface LeadsByStatus {
  status: LeadStatus;
  count: number;
}

/**
 * Lead by Municipality Count
 */
export interface LeadsByMunicipality {
  municipality: string;
  count: number;
}

/**
 * Crop Type Statistics
 */
export interface CropTypeStatistics {
  cropType: CropType;
  count: number;
  totalArea: number;
  averageArea: number;
}

/**
 * Dashboard Statistics Response
 * Legacy interface for feature dashboard compatibility
 */
export interface DashboardStatistics {
  totalLeads: number;
  newLeads: number;
  leadsInNegotiation: number;
  convertedLeads: number;
  lostLeads: number;
  priorityLeads: number;
}

/**
 * Priority Lead with additional data
 * Legacy interface for feature dashboard compatibility
 */
export interface PriorityLead {
  id: string;
  name: string;
  cpf: string;
  municipality: string;
  status: LeadStatus;
  totalArea: number;
  propertyCount: number;
  createdAt: Date;
  updatedAt: Date;
}
