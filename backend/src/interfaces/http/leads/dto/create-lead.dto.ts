import { IsString, IsEnum, IsOptional, Length, Matches } from 'class-validator';
import { LeadStatus } from '../../../../domain/leads/lead-status.enum';

/**
 * DTO for creating a new Lead
 * Used in POST /leads endpoint
 */
export class CreateLeadDto {
  @IsString()
  @Length(3, 255, { message: 'Name must be between 3 and 255 characters' })
  name: string;

  @IsString()
  @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF must be in format 00000000000 or 000.000.000-00',
  })
  cpf: string;

  @IsEnum(LeadStatus, { message: 'Invalid lead status' })
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  @Length(0, 5000, { message: 'Comments must not exceed 5000 characters' })
  comments?: string;

  @IsString()
  @Length(2, 255, { message: 'Municipality must be between 2 and 255 characters' })
  municipality: string;
}
