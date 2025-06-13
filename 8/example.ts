import { Schema } from './schema';

console.log('🚀 Robust Validation Library Demo\n');

// Example 1: Basic string validation
console.log('📝 Example 1: Basic String Validation');
const nameValidator = Schema.string().minLength(2).maxLength(50);
const nameResult = nameValidator.validate("John Doe");
console.log('Valid name:', nameResult);

const invalidNameResult = nameValidator.validate("J");
console.log('Invalid name:', invalidNameResult);
console.log();

// Example 2: Email validation with custom message
console.log('📧 Example 2: Email Validation');
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage("Please provide a valid email address");

const emailResult = emailValidator.validate("user@example.com");
console.log('Valid email:', emailResult);

const invalidEmailResult = emailValidator.validate("invalid-email");
console.log('Invalid email:', invalidEmailResult);
console.log();

// Example 3: Number validation
console.log('🔢 Example 3: Number Validation');
const ageValidator = Schema.number().min(0).max(120).integer();
const ageResult = ageValidator.validate(25);
console.log('Valid age:', ageResult);

const invalidAgeResult = ageValidator.validate(150.5);
console.log('Invalid age:', invalidAgeResult);
console.log();

// Example 4: Array validation
console.log('📊 Example 4: Array Validation');
const tagsValidator = Schema.array(Schema.string().minLength(1)).minItems(1).maxItems(5);
const tagsResult = tagsValidator.validate(["javascript", "typescript", "validation"]);
console.log('Valid tags:', tagsResult);

const invalidTagsResult = tagsValidator.validate(["", "typescript"]);
console.log('Invalid tags:', invalidTagsResult);
console.log();

// Example 5: Complex object validation
console.log('👤 Example 5: Complex Object Validation');
const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).max(120).optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  preferences: Schema.object({
    theme: Schema.string(),
    notifications: Schema.boolean()
  }).optional()
});

const validUser = {
  id: "user123",
  name: "Jane Smith",
  email: "jane@example.com",
  age: 28,
  isActive: true,
  tags: ["developer", "team-lead"],
  preferences: {
    theme: "dark",
    notifications: true
  }
};

const userResult = userSchema.validate(validUser);
console.log('Valid user object:', { 
  isValid: userResult.isValid, 
  errorsCount: userResult.errors.length 
});

const invalidUser = {
  id: 123, // should be string
  name: "J", // too short
  email: "invalid-email",
  isActive: "yes", // should be boolean
  tags: "not-an-array"
};

const invalidUserResult = userSchema.validate(invalidUser);
console.log('Invalid user object:');
console.log('- Valid:', invalidUserResult.isValid);
console.log('- Errors:', invalidUserResult.errors);
console.log();

// Example 6: Date validation
console.log('📅 Example 6: Date Validation');
const futureDateValidator = Schema.date().minDate(new Date());
const dateResult = futureDateValidator.validate(new Date('2025-12-31'));
console.log('Valid future date:', { isValid: dateResult.isValid });

const pastDateResult = futureDateValidator.validate(new Date('2020-01-01'));
console.log('Invalid past date:', { isValid: pastDateResult.isValid, errors: pastDateResult.errors });
console.log();

console.log('✅ Demo completed! The validation library is working correctly.');
console.log('📊 Run "npm run test:coverage" to see detailed test coverage report.');
console.log('📖 Check README.md for comprehensive documentation.'); 