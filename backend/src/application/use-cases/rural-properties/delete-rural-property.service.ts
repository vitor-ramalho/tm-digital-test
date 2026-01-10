import { Injectable, NotFoundException } from '@nestjs/common';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';

/**
 * Use case: Delete a Rural Property
 * Validates existence before deletion
 */
@Injectable()
export class DeleteRuralPropertyService {
  constructor(private readonly ruralPropertyRepository: RuralPropertyRepository) {}

  async execute(id: string): Promise<void> {
    // Check if property exists
    const existing = await this.ruralPropertyRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Rural property with ID ${id} not found`);
    }

    // Delete
    const deleted = await this.ruralPropertyRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete rural property with ID ${id}`);
    }
  }
}
