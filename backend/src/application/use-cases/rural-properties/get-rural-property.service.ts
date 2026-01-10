import { Injectable, NotFoundException } from '@nestjs/common';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';

/**
 * Use case: Get a single Rural Property by ID
 */
@Injectable()
export class GetRuralPropertyService {
  constructor(private readonly ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(id: string): Promise<RuralProperty> {
    const property = await this.ruralPropertyRepository.findById(id);
    if (!property) {
      throw new NotFoundException(`Rural property with ID ${id} not found`);
    }
    return property;
  }
}
