import { CropType } from './crop-type.enum';

/**
 * Domain Entity - RuralProperty
 * Represents agricultural land associated with a lead
 * This is framework-agnostic and contains business logic
 */
export class RuralProperty {
  id: string;
  leadId: string;
  cropType: CropType;
  areaHectares: number;
  geometry?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RuralProperty>) {
    Object.assign(this, partial);
  }

  /**
   * Business rule: High priority threshold
   * Properties with area > 100 hectares are considered high priority
   */
  static readonly HIGH_PRIORITY_THRESHOLD = 100;

  /**
   * Business rule: Check if this property is high priority
   */
  isHighPriority(): boolean {
    return this.areaHectares > RuralProperty.HIGH_PRIORITY_THRESHOLD;
  }

  /**
   * Business rule: Validate area is positive
   */
  static isValidArea(areaHectares: number): boolean {
    return areaHectares > 0;
  }

  /**
   * Business rule: Get property size classification
   */
  getSizeClassification(): 'SMALL' | 'MEDIUM' | 'LARGE' {
    if (this.areaHectares <= 50) return 'SMALL';
    if (this.areaHectares <= 100) return 'MEDIUM';
    return 'LARGE';
  }
}
