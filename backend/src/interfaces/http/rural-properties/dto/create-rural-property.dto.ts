import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CropType } from '../../../../domain/rural-properties/crop-type.enum';

/**
 * DTO for creating a new Rural Property
 * Used in POST /rural-properties endpoint
 */
export class CreateRuralPropertyDto {
  @IsString()
  leadId: string;

  @IsEnum(CropType, { message: 'Crop type must be SOY, CORN, or COTTON' })
  cropType: CropType;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Area must be a number with at most 2 decimal places' },
  )
  @Type(() => Number)
  @Min(0.01, { message: 'Area must be greater than 0' })
  @Max(99999999.99, { message: 'Area exceeds maximum allowed value' })
  areaHectares: number;

  @IsString()
  @IsOptional()
  geometry?: string; // GeoJSON, WKT, or simple coordinates
}
