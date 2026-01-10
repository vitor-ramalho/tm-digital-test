import { Injectable } from '@nestjs/common';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';

export interface ListRuralPropertiesFilters {
  leadId?: string;
  cropType?: CropType;
  minArea?: number;
  maxArea?: number;
  highPriorityOnly?: boolean;
}

/**
 * Use case: List Rural Properties with optional filtering
 */
@Injectable()
export class ListRuralPropertiesService {
  constructor(private readonly ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(filters?: ListRuralPropertiesFilters): Promise<RuralProperty[]> {
    return this.ruralPropertyRepository.findAll(filters);
  }

  async findByLeadId(leadId: string): Promise<RuralProperty[]> {
    return this.ruralPropertyRepository.findByLeadId(leadId);
  }

  async findByCropType(cropType: CropType): Promise<RuralProperty[]> {
    return this.ruralPropertyRepository.findByCropType(cropType);
  }

  async findHighPriorityProperties(): Promise<RuralProperty[]> {
    return this.ruralPropertyRepository.findHighPriorityProperties();
  }
}
