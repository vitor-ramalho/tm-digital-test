import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { CropType } from '@domain/rural-properties/crop-type.enum';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

export interface CreateRuralPropertyDto {
  leadId: string;
  cropType: CropType;
  areaHectares: number;
  geometry?: string;
}

/**
 * Use case: Create a new Rural Property
 * Validates that lead exists and area is valid
 */
@Injectable()
export class CreateRuralPropertyService {
  constructor(
    private readonly ruralPropertyRepository: RuralPropertyRepository,
    private readonly leadRepository: LeadRepository,
  ) {}

  async execute(dto: CreateRuralPropertyDto): Promise<RuralProperty> {
    // Validate that lead exists
    const leadExists = await this.leadRepository.findById(dto.leadId);
    if (!leadExists) {
      throw new NotFoundException(`Lead with ID ${dto.leadId} not found`);
    }

    // Validate area using domain method
    if (!RuralProperty.isValidArea(dto.areaHectares)) {
      throw new BadRequestException('Area must be a positive number greater than 0');
    }

    // Create domain entity
    const property = new RuralProperty({
      leadId: dto.leadId,
      cropType: dto.cropType,
      areaHectares: dto.areaHectares,
      geometry: dto.geometry,
    });

    // Persist
    return this.ruralPropertyRepository.create(property);
  }
}
