import { IsString, IsEnum, IsOptional } from 'class-validator';
import { CropType } from '../../../../domain/rural-properties/crop-type.enum';

/**
 * DTO for filtering and querying rural properties
 * Used in GET /rural-properties endpoint with query parameters
 */
export class FilterRuralPropertiesDto {
  @IsString()
  @IsOptional()
  leadId?: string;

  @IsEnum(CropType, { message: 'Crop type must be SOY, CORN, or COTTON' })
  @IsOptional()
  cropType?: CropType;

  @IsOptional()
  highPriorityOnly?: boolean; // Filter properties > 100ha

  @IsOptional()
  minArea?: number; // Minimum area in hectares

  @IsOptional()
  maxArea?: number; // Maximum area in hectares
}
