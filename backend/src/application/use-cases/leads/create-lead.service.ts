import { Injectable, ConflictException } from '@nestjs/common';
import { Lead } from '@domain/leads/lead.entity';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Cpf } from '@domain/leads/cpf.value-object';

export interface CreateLeadDto {
  name: string;
  cpf: string;
  municipality: string;
  comments?: string;
}

/**
 * Use case: Create a new Lead
 * Validates CPF uniqueness and creates the lead
 */
@Injectable()
export class CreateLeadService {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(dto: CreateLeadDto): Promise<Lead> {
    // Validate CPF format
    const cpfObj = Cpf.create(dto.cpf);

    // Check if CPF already exists
    const exists = await this.leadRepository.existsByCpf(cpfObj.getValue());
    if (exists) {
      throw new ConflictException(`CPF ${dto.cpf} is already registered`);
    }

    // Create domain entity
    const lead = new Lead({
      name: dto.name,
      cpf: cpfObj.getValue(),
      municipality: dto.municipality,
      comments: dto.comments,
    });

    // Persist
    return this.leadRepository.create(lead);
  }
}
