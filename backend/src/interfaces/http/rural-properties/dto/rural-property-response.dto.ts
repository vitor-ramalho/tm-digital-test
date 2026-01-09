import { CropType } from '../../../../domain/rural-properties/crop-type.enum';

/**
 * DTO for Rural Property response
 * Used in API responses
 */
export class RuralPropertyResponseDto {
  id: string;
  leadId: string;
  cropType: CropType;
  areaHectares: number;
  geometry?: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Indicates if this property is high priority (> 100 hectares)
   * Useful for frontend visual indicators
   */
  isHighPriority: boolean;

  /**
   * Size classification: SMALL, MEDIUM, or LARGE
   */
  sizeClassification: 'SMALL' | 'MEDIUM' | 'LARGE';

  /**
   * Optional: Lead information included in property details
   */
  lead?: {
    id: string;
    name: string;
    municipality: string;
  };
}
