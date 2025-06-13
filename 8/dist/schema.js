"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.ObjectValidator = exports.ArrayValidator = exports.DateValidator = exports.BooleanValidator = exports.NumberValidator = exports.StringValidator = exports.Validator = void 0;
/**
 * Base validator class that all validators extend
 */
class Validator {
    constructor() {
        this._optional = false;
    }
    /**
     * Marks this validator as optional
     */
    optional() {
        this._optional = true;
        return this;
    }
    /**
     * Sets a custom error message for validation failures
     */
    withMessage(message) {
        this.customMessage = message;
        return this;
    }
    /**
     * Helper method to create validation result
     */
    createResult(isValid, errors = [], value) {
        return { isValid, errors, value };
    }
    /**
     * Helper method to handle optional values
     */
    handleOptional(value) {
        if (this._optional && (value === undefined || value === null)) {
            return this.createResult(true, [], value);
        }
        return null;
    }
}
exports.Validator = Validator;
/**
 * String validator with various string-specific validations
 */
class StringValidator extends Validator {
    /**
     * Sets minimum length requirement
     */
    minLength(min) {
        this._minLength = min;
        return this;
    }
    /**
     * Sets maximum length requirement
     */
    maxLength(max) {
        this._maxLength = max;
        return this;
    }
    /**
     * Sets pattern (regex) requirement
     */
    pattern(regex) {
        this._pattern = regex;
        return this;
    }
    validate(value) {
        const optionalResult = this.handleOptional(value);
        if (optionalResult)
            return optionalResult;
        const errors = [];
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
exports.StringValidator = StringValidator;
/**
 * Number validator with numeric-specific validations
 */
class NumberValidator extends Validator {
    /**
     * Sets minimum value requirement
     */
    min(min) {
        this._min = min;
        return this;
    }
    /**
     * Sets maximum value requirement
     */
    max(max) {
        this._max = max;
        return this;
    }
    /**
     * Requires the number to be an integer
     */
    integer() {
        this._integer = true;
        return this;
    }
    validate(value) {
        const optionalResult = this.handleOptional(value);
        if (optionalResult)
            return optionalResult;
        const errors = [];
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
exports.NumberValidator = NumberValidator;
/**
 * Boolean validator
 */
class BooleanValidator extends Validator {
    validate(value) {
        const optionalResult = this.handleOptional(value);
        if (optionalResult)
            return optionalResult;
        if (typeof value !== 'boolean') {
            const message = this.customMessage || `Expected boolean, got ${typeof value}`;
            return this.createResult(false, [message]);
        }
        return this.createResult(true, [], value);
    }
}
exports.BooleanValidator = BooleanValidator;
/**
 * Date validator with date-specific validations
 */
class DateValidator extends Validator {
    /**
     * Sets minimum date requirement
     */
    minDate(date) {
        this._minDate = date;
        return this;
    }
    /**
     * Sets maximum date requirement
     */
    maxDate(date) {
        this._maxDate = date;
        return this;
    }
    validate(value) {
        const optionalResult = this.handleOptional(value);
        if (optionalResult)
            return optionalResult;
        const errors = [];
        let dateValue;
        // Try to parse as Date
        if (value instanceof Date) {
            dateValue = value;
        }
        else if (typeof value === 'string' || typeof value === 'number') {
            dateValue = new Date(value);
        }
        else {
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
exports.DateValidator = DateValidator;
/**
 * Array validator for validating arrays with specific item types
 */
class ArrayValidator extends Validator {
    constructor(itemValidator) {
        super();
        this.itemValidator = itemValidator;
    }
    /**
     * Sets minimum number of items requirement
     */
    minItems(min) {
        this._minItems = min;
        return this;
    }
    /**
     * Sets maximum number of items requirement
     */
    maxItems(max) {
        this._maxItems = max;
        return this;
    }
    validate(value) {
        const optionalResult = this.handleOptional(value);
        if (optionalResult)
            return optionalResult;
        const errors = [];
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
        const validatedItems = [];
        for (let i = 0; i < value.length; i++) {
            const itemResult = this.itemValidator.validate(value[i]);
            if (!itemResult.isValid) {
                errors.push(`Item at index ${i}: ${itemResult.errors.join(', ')}`);
            }
            else {
                validatedItems.push(itemResult.value);
            }
        }
        return this.createResult(errors.length === 0, errors, validatedItems);
    }
}
exports.ArrayValidator = ArrayValidator;
/**
 * Object validator for validating objects with specific schemas
 */
class ObjectValidator extends Validator {
    constructor(schema) {
        super();
        this.schema = schema;
    }
    validate(value) {
        const optionalResult = this.handleOptional(value);
        if (optionalResult)
            return optionalResult;
        const errors = [];
        // Check if it's an object
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            const message = this.customMessage || `Expected object, got ${typeof value}`;
            return this.createResult(false, [message]);
        }
        const validatedObject = {};
        // Validate each property in the schema
        for (const [key, validator] of Object.entries(this.schema)) {
            const propertyValue = value[key];
            const propertyResult = validator.validate(propertyValue);
            if (!propertyResult.isValid) {
                errors.push(`Property '${key}': ${propertyResult.errors.join(', ')}`);
            }
            else {
                validatedObject[key] = propertyResult.value;
            }
        }
        return this.createResult(errors.length === 0, errors, validatedObject);
    }
}
exports.ObjectValidator = ObjectValidator;
/**
 * Main Schema builder class with static factory methods
 */
class Schema {
    /**
     * Creates a string validator
     */
    static string() {
        return new StringValidator();
    }
    /**
     * Creates a number validator
     */
    static number() {
        return new NumberValidator();
    }
    /**
     * Creates a boolean validator
     */
    static boolean() {
        return new BooleanValidator();
    }
    /**
     * Creates a date validator
     */
    static date() {
        return new DateValidator();
    }
    /**
     * Creates an object validator with the given schema
     */
    static object(schema) {
        return new ObjectValidator(schema);
    }
    /**
     * Creates an array validator with the given item validator
     */
    static array(itemValidator) {
        return new ArrayValidator(itemValidator);
    }
}
exports.Schema = Schema;
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
//# sourceMappingURL=schema.js.map