import { LeadStatus } from '../../../../domain/leads/lead-status.enum';

/**
 * DTO for Lead response
 * Used in API responses
 */
export class LeadResponseDto {
  id: string;
  name: string;
  cpf: string;
  status: LeadStatus;
  comments?: string;
  municipality: string;
  createdAt: Date;
  updatedAt: Date;
  
  /**
   * Indicates if this lead has at least one high priority property (> 100 hectares)
   * Useful for frontend visual indicators
   */
  isHighPriority?: boolean;

  /**
   * Count of rural properties associated with this lead
   */
  propertiesCount?: number;
}
