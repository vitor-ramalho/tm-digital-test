import { LeadStatus } from './lead-status.enum';

/**
 * Domain Entity - Lead
 * Represents a potential customer in the agricultural input distribution business
 * This is framework-agnostic and contains business logic
 */
export class Lead {
  id: string;
  name: string;
  cpf: string;
  status: LeadStatus;
  comments?: string;
  municipality: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Lead>) {
    Object.assign(this, partial);
  }

  /**
   * Business rule: Check if lead is in an active state
   */
  isActive(): boolean {
    return this.status !== LeadStatus.CONVERTED && this.status !== LeadStatus.LOST;
  }

  /**
   * Business rule: Check if lead can be converted
   */
  canBeConverted(): boolean {
    return this.status === LeadStatus.NEGOTIATION;
  }

  /**
   * Business rule: Validate CPF format (basic validation)
   */
  static isValidCpf(cpf: string): boolean {
    const cleanedCpf = cpf.replace(/\D/g, '');
    return cleanedCpf.length === 11;
  }

  /**
   * Business rule: Progress lead to next status
   */
  progressStatus(): void {
    const statusFlow: Record<LeadStatus, LeadStatus | null> = {
      [LeadStatus.NEW]: LeadStatus.INITIAL_CONTACT,
      [LeadStatus.INITIAL_CONTACT]: LeadStatus.NEGOTIATION,
      [LeadStatus.NEGOTIATION]: LeadStatus.CONVERTED,
      [LeadStatus.CONVERTED]: null,
      [LeadStatus.LOST]: null,
    };

    const nextStatus = statusFlow[this.status];
    if (nextStatus) {
      this.status = nextStatus;
      this.updatedAt = new Date();
    }
  }
}
