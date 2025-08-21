/**
 * Validation utilities for the application
 *
 * IMPORTANT: This file contains validation functions to prevent the creation
 * of batches with invalid quantities (0 or negative). Multiple validation layers
 * have been implemented:
 *
 * 1. Database Schema: Prisma schema with zod validation (min(1) for quantity)
 * 2. Application Logic: Validation functions in this file
 * 3. UI Components: Form validation and input constraints (min={1})
 * 4. Database Constraints: Check constraints in migrations (quantity > 0)
 *
 * These validations ensure that:
 * - No batch can be created with quantity <= 0
 * - No transaction can be created with quantity <= 0
 * - Users cannot submit forms with invalid quantities
 * - Database constraints prevent invalid data at the lowest level
 */

/**
 * Validates that a quantity is a positive number
 * @param quantity - The quantity to validate
 * @param fieldName - The name of the field for error messages
 * @returns An object with isValid boolean and error message if invalid
 */
export function validatePositiveQuantity(
  quantity: number,
  fieldName: string = "Quantity"
) {
  if (quantity === undefined || quantity === null) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (isNaN(quantity)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (quantity <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be greater than 0`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Validates that a batch quantity is valid for creation/update
 * @param quantity - The quantity to validate
 * @returns An object with isValid boolean and error message if invalid
 */
export function validateBatchQuantity(quantity: number) {
  return validatePositiveQuantity(quantity, "Batch quantity");
}

/**
 * Validates that a transaction quantity is valid
 * @param quantity - The quantity to validate
 * @returns An object with isValid boolean and error message if invalid
 */
export function validateTransactionQuantity(quantity: number) {
  return validatePositiveQuantity(quantity, "Transaction quantity");
}
