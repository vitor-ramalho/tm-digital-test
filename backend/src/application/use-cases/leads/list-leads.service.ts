import { Injectable } from '@nestjs/common';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';

export interface ListLeadsFilters {
  status?: LeadStatus;
  municipality?: string;
  search?: string;
}

/**
 * Use case: List Leads with optional filtering
 */
@Injectable()
export class ListLeadsService {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(filters?: ListLeadsFilters): Promise<Lead[]> {
    return this.leadRepository.findAll(filters);
  }

  async findByStatus(status: LeadStatus): Promise<Lead[]> {
    return this.leadRepository.findByStatus(status);
  }

  async findByMunicipality(municipality: string): Promise<Lead[]> {
    return this.leadRepository.findByMunicipality(municipality);
  }
}
