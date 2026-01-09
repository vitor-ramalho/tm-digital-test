import { IsString, IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '../../../../domain/leads/lead-status.enum';

/**
 * DTO for filtering and querying leads
 * Used in GET /leads endpoint with query parameters
 */
export class FilterLeadsDto {
  @IsEnum(LeadStatus, { message: 'Invalid lead status' })
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  municipality?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search in name or CPF

  @IsOptional()
  highPriorityOnly?: boolean; // Filter leads with properties > 100ha
}
