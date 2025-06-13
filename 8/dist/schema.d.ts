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
export declare abstract class Validator<T> {
    protected _optional: boolean;
    protected customMessage?: string;
    /**
     * Marks this validator as optional
     */
    optional(): this;
    /**
     * Sets a custom error message for validation failures
     */
    withMessage(message: string): this;
    /**
     * Abstract validation method that each validator must implement
     */
    abstract validate(value: any): ValidationResult;
    /**
     * Helper method to create validation result
     */
    protected createResult(isValid: boolean, errors?: string[], value?: T): ValidationResult;
    /**
     * Helper method to handle optional values
     */
    protected handleOptional(value: any): ValidationResult | null;
}
/**
 * String validator with various string-specific validations
 */
export declare class StringValidator extends Validator<string> {
    private _minLength?;
    private _maxLength?;
    private _pattern?;
    /**
     * Sets minimum length requirement
     */
    minLength(min: number): this;
    /**
     * Sets maximum length requirement
     */
    maxLength(max: number): this;
    /**
     * Sets pattern (regex) requirement
     */
    pattern(regex: RegExp): this;
    validate(value: any): ValidationResult;
}
/**
 * Number validator with numeric-specific validations
 */
export declare class NumberValidator extends Validator<number> {
    private _min?;
    private _max?;
    private _integer?;
    /**
     * Sets minimum value requirement
     */
    min(min: number): this;
    /**
     * Sets maximum value requirement
     */
    max(max: number): this;
    /**
     * Requires the number to be an integer
     */
    integer(): this;
    validate(value: any): ValidationResult;
}
/**
 * Boolean validator
 */
export declare class BooleanValidator extends Validator<boolean> {
    validate(value: any): ValidationResult;
}
/**
 * Date validator with date-specific validations
 */
export declare class DateValidator extends Validator<Date> {
    private _minDate?;
    private _maxDate?;
    /**
     * Sets minimum date requirement
     */
    minDate(date: Date): this;
    /**
     * Sets maximum date requirement
     */
    maxDate(date: Date): this;
    validate(value: any): ValidationResult;
}
/**
 * Array validator for validating arrays with specific item types
 */
export declare class ArrayValidator<T> extends Validator<T[]> {
    private itemValidator;
    private _minItems?;
    private _maxItems?;
    constructor(itemValidator: Validator<T>);
    /**
     * Sets minimum number of items requirement
     */
    minItems(min: number): this;
    /**
     * Sets maximum number of items requirement
     */
    maxItems(max: number): this;
    validate(value: any): ValidationResult;
}
/**
 * Object validator for validating objects with specific schemas
 */
export declare class ObjectValidator<T> extends Validator<T> {
    private schema;
    constructor(schema: Record<string, Validator<any>>);
    validate(value: any): ValidationResult;
}
/**
 * Main Schema builder class with static factory methods
 */
export declare class Schema {
    /**
     * Creates a string validator
     */
    static string(): StringValidator;
    /**
     * Creates a number validator
     */
    static number(): NumberValidator;
    /**
     * Creates a boolean validator
     */
    static boolean(): BooleanValidator;
    /**
     * Creates a date validator
     */
    static date(): DateValidator;
    /**
     * Creates an object validator with the given schema
     */
    static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T>;
    /**
     * Creates an array validator with the given item validator
     */
    static array<T>(itemValidator: Validator<T>): ArrayValidator<T>;
}
//# sourceMappingURL=schema.d.ts.map