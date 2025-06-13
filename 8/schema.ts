/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  value?: any;
}

/**
 * Base validator class that all validators extend
 */
export abstract class Validator<T> {
  protected _optional: boolean = false;
  protected customMessage?: string;

  /**
   * Marks this validator as optional
   */
  optional(): this {
    this._optional = true;
    return this;
  }

  /**
   * Sets a custom error message for validation failures
   */
  withMessage(message: string): this {
    this.customMessage = message;
    return this;
  }

  /**
   * Abstract validation method that each validator must implement
   */
  abstract validate(value: any): ValidationResult;

  /**
   * Helper method to create validation result
   */
  protected createResult(isValid: boolean, errors: string[] = [], value?: T): ValidationResult {
    return { isValid, errors, value };
  }

  /**
   * Helper method to handle optional values
   */
  protected handleOptional(value: any): ValidationResult | null {
    if (this._optional && (value === undefined || value === null)) {
      return this.createResult(true, [], value);
    }
    return null;
  }
}

/**
 * String validator with various string-specific validations
 */
export class StringValidator extends Validator<string> {
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: RegExp;

  /**
   * Sets minimum length requirement
   */
  minLength(min: number): this {
    this._minLength = min;
    return this;
  }

  /**
   * Sets maximum length requirement
   */
  maxLength(max: number): this {
    this._maxLength = max;
    return this;
  }

  /**
   * Sets pattern (regex) requirement
   */
  pattern(regex: RegExp): this {
    this._pattern = regex;
    return this;
  }

  validate(value: any): ValidationResult {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    const errors: string[] = [];

    // Check if it's a string
    if (typeof value !== 'string') {
      const message = this.customMessage || `Expected string, got ${typeof value}`;
      return this.createResult(false, [message]);
    }

    // Check min length
    if (this._minLength !== undefined && value.length < this._minLength) {
      errors.push(`String must be at least ${this._minLength} characters long`);
    }

    // Check max length
    if (this._maxLength !== undefined && value.length > this._maxLength) {
      errors.push(`String must be at most ${this._maxLength} characters long`);
    }

    // Check pattern
    if (this._pattern && !this._pattern.test(value)) {
      errors.push(this.customMessage || 'String does not match required pattern');
    }

    return this.createResult(errors.length === 0, errors, value);
  }
}

/**
 * Number validator with numeric-specific validations
 */
export class NumberValidator extends Validator<number> {
  private _min?: number;
  private _max?: number;
  private _integer?: boolean;

  /**
   * Sets minimum value requirement
   */
  min(min: number): this {
    this._min = min;
    return this;
  }

  /**
   * Sets maximum value requirement
   */
  max(max: number): this {
    this._max = max;
    return this;
  }

  /**
   * Requires the number to be an integer
   */
  integer(): this {
    this._integer = true;
    return this;
  }

  validate(value: any): ValidationResult {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    const errors: string[] = [];

    // Check if it's a number
    if (typeof value !== 'number' || isNaN(value)) {
      const message = this.customMessage || `Expected number, got ${typeof value}`;
      return this.createResult(false, [message]);
    }

    // Check min value
    if (this._min !== undefined && value < this._min) {
      errors.push(`Number must be at least ${this._min}`);
    }

    // Check max value
    if (this._max !== undefined && value > this._max) {
      errors.push(`Number must be at most ${this._max}`);
    }

    // Check if integer is required
    if (this._integer && !Number.isInteger(value)) {
      errors.push('Number must be an integer');
    }

    return this.createResult(errors.length === 0, errors, value);
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends Validator<boolean> {
  validate(value: any): ValidationResult {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    if (typeof value !== 'boolean') {
      const message = this.customMessage || `Expected boolean, got ${typeof value}`;
      return this.createResult(false, [message]);
    }

    return this.createResult(true, [], value);
  }
}

/**
 * Date validator with date-specific validations
 */
export class DateValidator extends Validator<Date> {
  private _minDate?: Date;
  private _maxDate?: Date;

  /**
   * Sets minimum date requirement
   */
  minDate(date: Date): this {
    this._minDate = date;
    return this;
  }

  /**
   * Sets maximum date requirement
   */
  maxDate(date: Date): this {
    this._maxDate = date;
    return this;
  }

  validate(value: any): ValidationResult {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    const errors: string[] = [];
    let dateValue: Date;

    // Try to parse as Date
    if (value instanceof Date) {
      dateValue = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      dateValue = new Date(value);
    } else {
      const message = this.customMessage || `Expected Date, got ${typeof value}`;
      return this.createResult(false, [message]);
    }

    // Check if date is valid
    if (isNaN(dateValue.getTime())) {
      const message = this.customMessage || 'Invalid date';
      return this.createResult(false, [message]);
    }

    // Check min date
    if (this._minDate && dateValue < this._minDate) {
      errors.push(`Date must be after ${this._minDate.toISOString()}`);
    }

    // Check max date
    if (this._maxDate && dateValue > this._maxDate) {
      errors.push(`Date must be before ${this._maxDate.toISOString()}`);
    }

    return this.createResult(errors.length === 0, errors, dateValue);
  }
}

/**
 * Array validator for validating arrays with specific item types
 */
export class ArrayValidator<T> extends Validator<T[]> {
  private _minItems?: number;
  private _maxItems?: number;

  constructor(private itemValidator: Validator<T>) {
    super();
  }

  /**
   * Sets minimum number of items requirement
   */
  minItems(min: number): this {
    this._minItems = min;
    return this;
  }

  /**
   * Sets maximum number of items requirement
   */
  maxItems(max: number): this {
    this._maxItems = max;
    return this;
  }

  validate(value: any): ValidationResult {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    const errors: string[] = [];

    // Check if it's an array
    if (!Array.isArray(value)) {
      const message = this.customMessage || `Expected array, got ${typeof value}`;
      return this.createResult(false, [message]);
    }

    // Check min items
    if (this._minItems !== undefined && value.length < this._minItems) {
      errors.push(`Array must have at least ${this._minItems} items`);
    }

    // Check max items
    if (this._maxItems !== undefined && value.length > this._maxItems) {
      errors.push(`Array must have at most ${this._maxItems} items`);
    }

    // Validate each item
    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      if (!itemResult.isValid) {
        errors.push(`Item at index ${i}: ${itemResult.errors.join(', ')}`);
      } else {
        validatedItems.push(itemResult.value);
      }
    }

    return this.createResult(errors.length === 0, errors, validatedItems);
  }
}

/**
 * Object validator for validating objects with specific schemas
 */
export class ObjectValidator<T> extends Validator<T> {
  constructor(private schema: Record<string, Validator<any>>) {
    super();
  }

  validate(value: any): ValidationResult {
    const optionalResult = this.handleOptional(value);
    if (optionalResult) return optionalResult;

    const errors: string[] = [];

    // Check if it's an object
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      const message = this.customMessage || `Expected object, got ${typeof value}`;
      return this.createResult(false, [message]);
    }

    const validatedObject: any = {};

    // Validate each property in the schema
    for (const [key, validator] of Object.entries(this.schema)) {
      const propertyValue = value[key];
      const propertyResult = validator.validate(propertyValue);
      
      if (!propertyResult.isValid) {
        errors.push(`Property '${key}': ${propertyResult.errors.join(', ')}`);
      } else {
        validatedObject[key] = propertyResult.value;
      }
    }

    return this.createResult(errors.length === 0, errors, validatedObject);
  }
}

/**
 * Main Schema builder class with static factory methods
 */
export class Schema {
  /**
   * Creates a string validator
   */
  static string(): StringValidator {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator
   */
  static date(): DateValidator {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with the given schema
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
  
  /**
   * Creates an array validator with the given item validator
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
}

// Example usage with complex schema
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});

// Example validation
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);
console.log('Validation result:', result); 