import { Injectable } from '@nestjs/common';
import { Lead } from '@domain/leads/lead.entity';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

/**
 * Use case: Get Priority Leads
 * Returns leads that have at least one rural property with area > 100 hectares
 */
@Injectable()
export class GetPriorityLeadsService {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(): Promise<Lead[]> {
    return this.leadRepository.findHighPriorityLeads();
  }
}
