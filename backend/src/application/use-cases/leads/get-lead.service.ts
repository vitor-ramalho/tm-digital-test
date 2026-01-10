import { Injectable, NotFoundException } from '@nestjs/common';
import { Lead } from '@domain/leads/lead.entity';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

/**
 * Use case: Get a single Lead by ID
 */
@Injectable()
export class GetLeadService {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async getWithPropertiesCount(
    id: string,
  ): Promise<{ lead: Lead; propertiesCount: number }> {
    const result = await this.leadRepository.findByIdWithPropertiesCount(id);
    if (!result) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return result;
  }
}
