import { RuralProperty } from './rural-property.entity';
import { CropType } from './crop-type.enum';

describe('RuralProperty Entity', () => {
  const createProperty = (areaHectares: number): RuralProperty => {
    return new RuralProperty({
      id: '123e4567-e89b-12d3-a456-426614174000',
      leadId: 'lead-123',
      cropType: CropType.SOY,
      areaHectares,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  };

  describe('constructor', () => {
    it('should create a property with all required fields', () => {
      const property = createProperty(150);

      expect(property.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(property.leadId).toBe('lead-123');
      expect(property.cropType).toBe(CropType.SOY);
      expect(property.areaHectares).toBe(150);
    });

    it('should create a property with optional geometry', () => {
      const property = new RuralProperty({
        id: '1',
        leadId: 'lead-456',
        cropType: CropType.CORN,
        areaHectares: 80,
        geometry: '{"type":"Polygon","coordinates":[[[0,0],[0,1],[1,1],[1,0],[0,0]]]}',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(property.geometry).toBeDefined();
      expect(property.geometry).toContain('Polygon');
    });

    it('should support all crop types', () => {
      const soyProperty = createProperty(100);
      soyProperty.cropType = CropType.SOY;
      expect(soyProperty.cropType).toBe(CropType.SOY);

      const cornProperty = createProperty(100);
      cornProperty.cropType = CropType.CORN;
      expect(cornProperty.cropType).toBe(CropType.CORN);

      const cottonProperty = createProperty(100);
      cottonProperty.cropType = CropType.COTTON;
      expect(cottonProperty.cropType).toBe(CropType.COTTON);
    });
  });

  describe('HIGH_PRIORITY_THRESHOLD', () => {
    it('should have threshold value of 100', () => {
      expect(RuralProperty.HIGH_PRIORITY_THRESHOLD).toBe(100);
    });
  });

  describe('isHighPriority', () => {
    it('should return true for property with area > 100 hectares', () => {
      const property = createProperty(101);
      expect(property.isHighPriority()).toBe(true);
    });

    it('should return true for property with area much larger than threshold', () => {
      const property = createProperty(500);
      expect(property.isHighPriority()).toBe(true);
    });

    it('should return false for property with area = 100 hectares', () => {
      const property = createProperty(100);
      expect(property.isHighPriority()).toBe(false);
    });

    it('should return false for property with area < 100 hectares', () => {
      const property = createProperty(99);
      expect(property.isHighPriority()).toBe(false);
    });

    it('should return false for small property', () => {
      const property = createProperty(10);
      expect(property.isHighPriority()).toBe(false);
    });
  });

  describe('isValidArea', () => {
    it('should return true for positive area', () => {
      expect(RuralProperty.isValidArea(1)).toBe(true);
      expect(RuralProperty.isValidArea(50)).toBe(true);
      expect(RuralProperty.isValidArea(100)).toBe(true);
      expect(RuralProperty.isValidArea(1000)).toBe(true);
    });

    it('should return true for decimal areas', () => {
      expect(RuralProperty.isValidArea(0.5)).toBe(true);
      expect(RuralProperty.isValidArea(99.99)).toBe(true);
    });

    it('should return false for zero area', () => {
      expect(RuralProperty.isValidArea(0)).toBe(false);
    });

    it('should return false for negative area', () => {
      expect(RuralProperty.isValidArea(-1)).toBe(false);
      expect(RuralProperty.isValidArea(-100)).toBe(false);
    });
  });

  describe('getSizeClassification', () => {
    it('should return SMALL for area <= 50 hectares', () => {
      expect(createProperty(1).getSizeClassification()).toBe('SMALL');
      expect(createProperty(25).getSizeClassification()).toBe('SMALL');
      expect(createProperty(50).getSizeClassification()).toBe('SMALL');
    });

    it('should return MEDIUM for area between 51 and 100 hectares', () => {
      expect(createProperty(51).getSizeClassification()).toBe('MEDIUM');
      expect(createProperty(75).getSizeClassification()).toBe('MEDIUM');
      expect(createProperty(100).getSizeClassification()).toBe('MEDIUM');
    });

    it('should return LARGE for area > 100 hectares', () => {
      expect(createProperty(101).getSizeClassification()).toBe('LARGE');
      expect(createProperty(200).getSizeClassification()).toBe('LARGE');
      expect(createProperty(1000).getSizeClassification()).toBe('LARGE');
    });
  });

  describe('business rules integration', () => {
    it('should classify high priority property as LARGE', () => {
      const property = createProperty(150);

      expect(property.isHighPriority()).toBe(true);
      expect(property.getSizeClassification()).toBe('LARGE');
    });

    it('should not classify MEDIUM property as high priority', () => {
      const property = createProperty(75);

      expect(property.isHighPriority()).toBe(false);
      expect(property.getSizeClassification()).toBe('MEDIUM');
    });

    it('should not classify SMALL property as high priority', () => {
      const property = createProperty(30);

      expect(property.isHighPriority()).toBe(false);
      expect(property.getSizeClassification()).toBe('SMALL');
    });

    it('should handle edge case at threshold boundary', () => {
      const property = createProperty(100);

      // At exactly 100 hectares
      expect(property.isHighPriority()).toBe(false); // Not > 100
      expect(property.getSizeClassification()).toBe('MEDIUM'); // <= 100
    });

    it('should handle edge case just above threshold', () => {
      const property = createProperty(100.01);

      expect(property.isHighPriority()).toBe(true); // > 100
      expect(property.getSizeClassification()).toBe('LARGE'); // > 100
    });
  });
});
