import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Lead } from '@domain/leads/lead.entity';
import { LeadStatus } from '@domain/leads/lead-status.enum';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { Cpf } from '@domain/leads/cpf.value-object';

export interface UpdateLeadDto {
  name?: string;
  cpf?: string;
  status?: LeadStatus;
  municipality?: string;
  comments?: string;
}

/**
 * Use case: Update an existing Lead
 * Validates business rules and CPF uniqueness if changing CPF
 */
@Injectable()
export class UpdateLeadService {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(id: string, dto: UpdateLeadDto): Promise<Lead> {
    // Check if lead exists
    const existing = await this.leadRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    // If CPF is being changed, validate format and uniqueness
    if (dto.cpf && dto.cpf !== existing.cpf) {
      const cpfObj = Cpf.create(dto.cpf);
      const cpfExists = await this.leadRepository.existsByCpf(cpfObj.getValue(), id);
      if (cpfExists) {
        throw new ConflictException(`CPF ${dto.cpf} is already registered`);
      }
      dto.cpf = cpfObj.getValue();
    }

    // Validate status transition if status is being changed
    if (dto.status && dto.status !== existing.status) {
      this.validateStatusTransition(existing, dto.status);
    }

    // Update
    const updated = await this.leadRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Failed to update lead with ID ${id}`);
    }

    return updated;
  }

  private validateStatusTransition(lead: Lead, newStatus: LeadStatus): void {
    // Business rule: Cannot change status from LOST
    if (lead.status === LeadStatus.LOST) {
      throw new ConflictException('Cannot change status from LOST');
    }

    // Business rule: Cannot change status from CONVERTED to anything except LOST
    if (lead.status === LeadStatus.CONVERTED && newStatus !== LeadStatus.LOST) {
      throw new ConflictException('CONVERTED leads can only be marked as LOST');
    }

    // Business rule: Use domain method for progression validation
    if (newStatus !== LeadStatus.LOST && !lead.canBeConverted()) {
      // Additional business validation can be added here
    }
  }
}
