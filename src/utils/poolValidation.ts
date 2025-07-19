"use client";

import { validatePoolOperation } from "./poolUtils";

/**
 * Client-side validation hook for pool operations
 * This provides immediate validation before opening modals or forms
 */
export const usePoolValidation = () => {
  /**
   * Validate if a pool operation is allowed
   * @param locationId - The pool location ID
   * @param date - The operation date
   * @param operationType - The type of operation
   * @returns Promise with validation result
   */
  const validateOperation = async (
    locationId: number,
    date: string,
    operationType: "stocking" | "split" | "disposal" | "cancel" | "update"
  ) => {
    try {
      const result = await validatePoolOperation(
        locationId,
        date,
        operationType
      );
      return result;
    } catch (error) {
      return {
        allowed: false,
        message: `Помилка перевірки: ${
          error instanceof Error ? error.message : "Невідома помилка"
        }`,
        operationType,
      };
    }
  };

  /**
   * Show validation popup/alert
   * @param message - The message to display
   * @param isError - Whether this is an error message
   */
  const showValidationPopup = (message: string, isError: boolean = true) => {
    if (isError) {
      alert(`⚠️ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  /**
   * Validate and show popup if operation is not allowed
   * @param locationId - The pool location ID
   * @param date - The operation date
   * @param operationType - The type of operation
   * @returns Promise<boolean> - true if operation is allowed, false if blocked
   */
  const validateAndShowPopup = async (
    locationId: number,
    date: string,
    operationType: "stocking" | "split" | "disposal" | "cancel" | "update"
  ): Promise<boolean> => {
    const result = await validateOperation(locationId, date, operationType);

    if (!result.allowed) {
      showValidationPopup(result.message, true);
      return false;
    }

    return true;
  };

  return {
    validateOperation,
    showValidationPopup,
    validateAndShowPopup,
  };
};
