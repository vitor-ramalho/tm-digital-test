import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

/**
 * Use case: Delete a Lead
 * Validates existence before deletion
 */
@Injectable()
export class DeleteLeadService {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(id: string): Promise<void> {
    // Check if lead exists
    const existing = await this.leadRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // Delete (cascade will handle properties)
    const deleted = await this.leadRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Failed to delete lead with ID ${id}`);
    }
  }
}
