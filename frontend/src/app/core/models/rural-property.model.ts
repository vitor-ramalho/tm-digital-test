/**
 * Crop Type Enum
 * Aligned with backend domain
 */
export enum CropType {
  SOY = 'SOY',
  CORN = 'CORN',
  COTTON = 'COTTON'
}

/**
 * Size Classification
 */
export type SizeClassification = 'SMALL' | 'MEDIUM' | 'LARGE';

/**
 * Rural Property Model
 * Aligned with RuralPropertyResponseDto from backend
 */
export interface RuralProperty {
  id: string;
  leadId: string;
  cropType: CropType;
  areaHectares: number;
  geometry?: string;
  createdAt: Date;
  updatedAt: Date;
  isHighPriority: boolean;
  sizeClassification: SizeClassification;
  lead?: {
    id: string;
    name: string;
    municipality: string;
  };
}

/**
 * Create Rural Property DTO
 * Aligned with backend CreateRuralPropertyDto
 */
export interface CreateRuralPropertyDto {
  leadId: string;
  cropType: CropType;
  areaHectares: number;
  geometry?: string;
}

/**
 * Update Rural Property DTO
 * Aligned with backend UpdateRuralPropertyDto
 */
export interface UpdateRuralPropertyDto {
  cropType?: CropType;
  areaHectares?: number;
  geometry?: string;
}

/**
 * Filter Rural Properties DTO
 * For querying properties with filters
 */
export interface FilterRuralPropertiesDto {
  leadId?: string;
  cropType?: CropType;
  minArea?: number;
  maxArea?: number;
  isHighPriority?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Rural Property Statistics
 */
export interface RuralPropertyStatistics {
  totalProperties: number;
  totalArea: number;
  cropTypeCounts: { cropType: CropType; count: number; totalArea: number }[];
  averageAreaByCropType: { cropType: CropType; averageArea: number }[];
}
