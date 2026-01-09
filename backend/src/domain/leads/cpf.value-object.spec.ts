import { Cpf } from './cpf.value-object';

describe('Cpf Value Object', () => {
  describe('create', () => {
    it('should create a valid CPF from unformatted string', () => {
      const cpf = Cpf.create('12345678909');
      expect(cpf).toBeDefined();
      expect(cpf.getValue()).toBe('12345678909');
    });

    it('should create a valid CPF from formatted string', () => {
      const cpf = Cpf.create('123.456.789-09');
      expect(cpf).toBeDefined();
      expect(cpf.getValue()).toBe('12345678909');
    });

    it('should throw error for CPF with less than 11 digits', () => {
      expect(() => Cpf.create('123456789')).toThrow('Invalid CPF format');
    });

    it('should throw error for CPF with more than 11 digits', () => {
      expect(() => Cpf.create('123456789099')).toThrow('Invalid CPF format');
    });

    it('should throw error for CPF with all same digits', () => {
      expect(() => Cpf.create('11111111111')).toThrow('Invalid CPF format');
      expect(() => Cpf.create('00000000000')).toThrow('Invalid CPF format');
      expect(() => Cpf.create('99999999999')).toThrow('Invalid CPF format');
    });

    it('should throw error for CPF with invalid check digits', () => {
      expect(() => Cpf.create('12345678900')).toThrow('Invalid CPF format');
    });

    it('should validate real CPFs correctly', () => {
      // Valid CPFs - these are actual valid CPF numbers
      expect(() => Cpf.create('11144477735')).not.toThrow();
      expect(() => Cpf.create('52998224725')).not.toThrow();
    });
  });

  describe('getValue', () => {
    it('should return unformatted CPF', () => {
      const cpf = Cpf.create('123.456.789-09');
      expect(cpf.getValue()).toBe('12345678909');
    });
  });

  describe('getFormatted', () => {
    it('should return formatted CPF', () => {
      const cpf = Cpf.create('12345678909');
      expect(cpf.getFormatted()).toBe('123.456.789-09');
    });

    it('should format CPF created from formatted string', () => {
      const cpf = Cpf.create('111.444.777-35');
      expect(cpf.getFormatted()).toBe('111.444.777-35');
    });
  });

  describe('equals', () => {
    it('should return true for equal CPFs', () => {
      const cpf1 = Cpf.create('12345678909');
      const cpf2 = Cpf.create('123.456.789-09');
      expect(cpf1.equals(cpf2)).toBe(true);
    });

    it('should return false for different CPFs', () => {
      const cpf1 = Cpf.create('11144477735');
      const cpf2 = Cpf.create('52998224725');
      expect(cpf1.equals(cpf2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted CPF as string', () => {
      const cpf = Cpf.create('12345678909');
      expect(cpf.toString()).toBe('123.456.789-09');
    });
  });

  describe('immutability', () => {
    it('should not allow modification of CPF value', () => {
      const cpf = Cpf.create('12345678909');
      const value = cpf.getValue();
      
      // Value should always return the same result
      expect(cpf.getValue()).toBe(value);
      expect(cpf.getValue()).toBe('12345678909');
    });
  });
});
