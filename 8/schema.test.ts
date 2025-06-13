import { 
  Schema, 
  StringValidator, 
  NumberValidator, 
  ArrayValidator
} from './schema';

describe('Schema Validation Library', () => {
  
  describe('StringValidator', () => {
    test('should validate valid strings', () => {
      const validator = Schema.string();
      const result = validator.validate('hello');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.value).toBe('hello');
    });

    test('should reject non-strings', () => {
      const validator = Schema.string();
      const result = validator.validate(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected string, got number');
    });

    test('should validate minimum length', () => {
      const validator = Schema.string().minLength(5);
      
      const validResult = validator.validate('hello');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate('hi');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('String must be at least 5 characters long');
    });

    test('should validate maximum length', () => {
      const validator = Schema.string().maxLength(10);
      
      const validResult = validator.validate('hello');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate('this is too long');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('String must be at most 10 characters long');
    });

    test('should validate pattern', () => {
      const validator = Schema.string().pattern(/^[A-Z]+$/);
      
      const validResult = validator.validate('HELLO');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate('hello');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('String does not match required pattern');
    });

    test('should support custom error messages', () => {
      const validator = Schema.string().pattern(/^\d+$/).withMessage('Must be digits only');
      const result = validator.validate('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be digits only');
    });

    test('should handle optional strings', () => {
      const validator = Schema.string().optional();
      
      const validResult1 = validator.validate(undefined);
      expect(validResult1.isValid).toBe(true);
      
      const validResult2 = validator.validate(null);
      expect(validResult2.isValid).toBe(true);
      
      const validResult3 = validator.validate('hello');
      expect(validResult3.isValid).toBe(true);
    });

    test('should chain multiple validations', () => {
      const validator = Schema.string().minLength(2).maxLength(10).pattern(/^[a-zA-Z]+$/);
      
      const validResult = validator.validate('hello');
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate('a');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('String must be at least 2 characters long');
    });
  });

  describe('NumberValidator', () => {
    test('should validate valid numbers', () => {
      const validator = Schema.number();
      const result = validator.validate(42);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });

    test('should reject non-numbers', () => {
      const validator = Schema.number();
      const result = validator.validate('not a number');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected number, got string');
    });

    test('should reject NaN', () => {
      const validator = Schema.number();
      const result = validator.validate(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected number, got number');
    });

    test('should validate minimum value', () => {
      const validator = Schema.number().min(10);
      
      const validResult = validator.validate(15);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(5);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Number must be at least 10');
    });

    test('should validate maximum value', () => {
      const validator = Schema.number().max(100);
      
      const validResult = validator.validate(50);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(150);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Number must be at most 100');
    });

    test('should validate integer requirement', () => {
      const validator = Schema.number().integer();
      
      const validResult = validator.validate(42);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(42.5);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Number must be an integer');
    });

    test('should handle optional numbers', () => {
      const validator = Schema.number().optional();
      const result = validator.validate(undefined);
      expect(result.isValid).toBe(true);
    });

    test('should chain multiple validations', () => {
      const validator = Schema.number().min(1).max(100).integer();
      
      const validResult = validator.validate(50);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(150.5);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(2);
    });
  });

  describe('BooleanValidator', () => {
    test('should validate valid booleans', () => {
      const validator = Schema.boolean();
      
      const trueResult = validator.validate(true);
      expect(trueResult.isValid).toBe(true);
      expect(trueResult.value).toBe(true);
      
      const falseResult = validator.validate(false);
      expect(falseResult.isValid).toBe(true);
      expect(falseResult.value).toBe(false);
    });

    test('should reject non-booleans', () => {
      const validator = Schema.boolean();
      const result = validator.validate('true');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected boolean, got string');
    });

    test('should handle optional booleans', () => {
      const validator = Schema.boolean().optional();
      const result = validator.validate(undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('DateValidator', () => {
    test('should validate Date objects', () => {
      const validator = Schema.date();
      const date = new Date();
      const result = validator.validate(date);
      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(date);
    });

    test('should validate date strings', () => {
      const validator = Schema.date();
      const result = validator.validate('2023-01-01');
      expect(result.isValid).toBe(true);
      expect(result.value).toBeInstanceOf(Date);
    });

    test('should validate timestamp numbers', () => {
      const validator = Schema.date();
      const timestamp = Date.now();
      const result = validator.validate(timestamp);
      expect(result.isValid).toBe(true);
      expect(result.value).toBeInstanceOf(Date);
    });

    test('should reject invalid dates', () => {
      const validator = Schema.date();
      const result = validator.validate('invalid date');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid date');
    });

    test('should validate minimum date', () => {
      const minDate = new Date('2023-01-01');
      const validator = Schema.date().minDate(minDate);
      
      const validResult = validator.validate(new Date('2023-06-01'));
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(new Date('2022-06-01'));
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors[0]).toContain('Date must be after');
    });

    test('should validate maximum date', () => {
      const maxDate = new Date('2023-12-31');
      const validator = Schema.date().maxDate(maxDate);
      
      const validResult = validator.validate(new Date('2023-06-01'));
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(new Date('2024-06-01'));
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors[0]).toContain('Date must be before');
    });

    test('should handle optional dates', () => {
      const validator = Schema.date().optional();
      const result = validator.validate(undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('ArrayValidator', () => {
    test('should validate arrays with valid items', () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate(['hello', 'world']);
      expect(result.isValid).toBe(true);
      expect(result.value).toEqual(['hello', 'world']);
    });

    test('should reject non-arrays', () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate('not an array');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected array, got string');
    });

    test('should validate individual items', () => {
      const validator = Schema.array(Schema.string());
      const result = validator.validate(['hello', 123]);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Item at index 1');
    });

    test('should validate minimum items', () => {
      const validator = Schema.array(Schema.string()).minItems(2);
      
      const validResult = validator.validate(['a', 'b']);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(['a']);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Array must have at least 2 items');
    });

    test('should validate maximum items', () => {
      const validator = Schema.array(Schema.string()).maxItems(2);
      
      const validResult = validator.validate(['a', 'b']);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate(['a', 'b', 'c']);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Array must have at most 2 items');
    });

    test('should handle optional arrays', () => {
      const validator = Schema.array(Schema.string()).optional();
      const result = validator.validate(undefined);
      expect(result.isValid).toBe(true);
    });

    test('should work with complex item validators', () => {
      const validator = Schema.array(Schema.number().min(0).max(100));
      
      const validResult = validator.validate([10, 50, 90]);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validator.validate([10, 150, 90]);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors[0]).toContain('Item at index 1');
    });
  });

  describe('ObjectValidator', () => {
    test('should validate objects with valid properties', () => {
      const schema = {
        name: Schema.string(),
        age: Schema.number()
      };
      const validator = Schema.object(schema);
      
      const result = validator.validate({ name: 'John', age: 30 });
      expect(result.isValid).toBe(true);
      expect(result.value).toEqual({ name: 'John', age: 30 });
    });

    test('should reject non-objects', () => {
      const validator = Schema.object({ name: Schema.string() });
      
      const result1 = validator.validate('not an object');
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Expected object, got string');
      
      const result2 = validator.validate([]);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Expected object, got object');
    });

    test('should validate individual properties', () => {
      const schema = {
        name: Schema.string(),
        age: Schema.number()
      };
      const validator = Schema.object(schema);
      
      const result = validator.validate({ name: 123, age: 'not a number' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain("Property 'name'");
      expect(result.errors[1]).toContain("Property 'age'");
    });

    test('should handle optional properties', () => {
      const schema = {
        name: Schema.string(),
        age: Schema.number().optional()
      };
      const validator = Schema.object(schema);
      
      const result = validator.validate({ name: 'John' });
      expect(result.isValid).toBe(true);
    });

    test('should handle nested objects', () => {
      const addressSchema = Schema.object({
        street: Schema.string(),
        city: Schema.string()
      });
      
      const userSchema = Schema.object({
        name: Schema.string(),
        address: addressSchema
      });
      
      const result = userSchema.validate({
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      });
      
      expect(result.isValid).toBe(true);
    });

    test('should handle optional objects', () => {
      const validator = Schema.object({ name: Schema.string() }).optional();
      const result = validator.validate(undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Complex Schema Integration', () => {
    const addressSchema = Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
      country: Schema.string()
    });

    const userSchema = Schema.object({
      id: Schema.string(),
      name: Schema.string().minLength(2).maxLength(50),
      email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      age: Schema.number().optional(),
      isActive: Schema.boolean(),
      tags: Schema.array(Schema.string()),
      address: addressSchema.optional(),
      metadata: Schema.object({}).optional()
    });

    test('should validate complete valid user object', () => {
      const userData = {
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        isActive: true,
        tags: ["developer", "designer"],
        address: {
          street: "123 Main St",
          city: "Anytown",
          postalCode: "12345",
          country: "USA"
        },
        metadata: {}
      };

      const result = userSchema.validate(userData);
      expect(result.isValid).toBe(true);
    });

    test('should validate user object without optional fields', () => {
      const userData = {
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        tags: ["developer"]
      };

      const result = userSchema.validate(userData);
      expect(result.isValid).toBe(true);
    });

    test('should handle multiple validation errors', () => {
      const userData = {
        id: 12345, // should be string
        name: "J", // too short
        email: "invalid-email", // invalid format
        isActive: "yes", // should be boolean
        tags: "not-an-array", // should be array
        address: {
          street: "123 Main St",
          city: "Anytown",
          postalCode: "123", // invalid format
          country: "USA"
        }
      };

      const result = userSchema.validate(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    test('should handle nested validation errors', () => {
      const userData = {
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        tags: ["developer"],
        address: {
          street: "123 Main St",
          city: "Anytown",
          postalCode: "123", // invalid postal code
          country: "USA"
        }
      };

      const result = userSchema.validate(userData);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Property 'address'");
      expect(result.errors[0]).toContain('Postal code must be 5 digits');
    });
  });

  describe('Error Messages', () => {
    test('should use custom error messages when provided', () => {
      const validator = Schema.string().withMessage('Custom error message');
      const result = validator.validate(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom error message');
    });

    test('should provide default error messages when custom not provided', () => {
      const validator = Schema.string();
      const result = validator.validate(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expected string, got number');
    });
  });

  describe('Method Chaining', () => {
    test('should support method chaining for all validators', () => {
      const stringValidator = Schema.string().minLength(2).maxLength(10).pattern(/^[a-z]+$/).optional().withMessage('Custom message');
      expect(stringValidator).toBeInstanceOf(StringValidator);

      const numberValidator = Schema.number().min(0).max(100).integer().optional().withMessage('Custom message');
      expect(numberValidator).toBeInstanceOf(NumberValidator);

      const arrayValidator = Schema.array(Schema.string()).minItems(1).maxItems(5).optional().withMessage('Custom message');
      expect(arrayValidator).toBeInstanceOf(ArrayValidator);
    });
  });
}); 