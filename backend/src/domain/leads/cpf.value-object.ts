/**
 * Value Object - CPF (Cadastro de Pessoas Físicas)
 * Brazilian individual taxpayer registry identification
 * 
 * This is immutable and contains validation logic
 */
export class Cpf {
  private readonly value: string;

  private constructor(cpf: string) {
    this.value = cpf;
  }

  /**
   * Create a CPF value object from a string
   * Accepts formatted (000.000.000-00) or unformatted (00000000000) CPF
   */
  static create(cpf: string): Cpf {
    const cleaned = this.clean(cpf);
    
    if (!this.isValid(cleaned)) {
      throw new Error(`Invalid CPF format: ${cpf}`);
    }

    return new Cpf(cleaned);
  }

  /**
   * Remove formatting characters from CPF
   */
  private static clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Validate CPF format and check digits
   */
  private static isValid(cpf: string): boolean {
    // Must have 11 digits
    if (cpf.length !== 11) {
      return false;
    }

    // Cannot be all same digits
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validate check digits
    return this.validateCheckDigits(cpf);
  }

  /**
   * Validate CPF check digits using Brazilian algorithm
   */
  private static validateCheckDigits(cpf: string): boolean {
    // First check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9))) return false;

    // Second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Get unformatted CPF value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Get formatted CPF (000.000.000-00)
   */
  getFormatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Check if two CPFs are equal
   */
  equals(other: Cpf): boolean {
    return this.value === other.value;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.getFormatted();
  }
}
