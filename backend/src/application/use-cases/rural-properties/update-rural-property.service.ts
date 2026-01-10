import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

export interface UpdateRuralPropertyDto {
  leadId?: string;
  cropType?: CropType;
  areaHectares?: number;
  geometry?: string;
}

/**
 * Use case: Update an existing Rural Property
 * Validates business rules before updating
 */
@Injectable()
export class UpdateRuralPropertyService {
  constructor(
    private readonly ruralPropertyRepository: RuralPropertyRepository,
    private readonly leadRepository: LeadRepository,
  ) {}

  async execute(id: string, dto: UpdateRuralPropertyDto): Promise<RuralProperty> {
    // Check if property exists
    const existing = await this.ruralPropertyRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Rural property with ID ${id} not found`);
    }

    // If leadId is being changed, validate that new lead exists
    if (dto.leadId && dto.leadId !== existing.leadId) {
      const leadExists = await this.leadRepository.findById(dto.leadId);
      if (!leadExists) {
        throw new NotFoundException(`Lead with ID ${dto.leadId} not found`);
      }
    }

    // Validate area if being changed
    if (dto.areaHectares !== undefined && !RuralProperty.isValidArea(dto.areaHectares)) {
      throw new BadRequestException('Area must be a positive number greater than 0');
    }

    // Update
    const updated = await this.ruralPropertyRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Failed to update rural property with ID ${id}`);
    }

    return updated;
  }
}
