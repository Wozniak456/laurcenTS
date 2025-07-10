/**
 * Parses a string number that may use either dot (.) or comma (,) as decimal separator
 * @param value - The string value to parse
 * @returns The parsed number, or NaN if the value cannot be parsed
 */
export function parseDecimal(value: string): number {
  if (!value || typeof value !== "string") {
    return NaN;
  }
  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return NaN;
  }
  // Replace comma with dot for parsing
  const normalizedValue = trimmedValue.replace(",", ".");
  return parseFloat(normalizedValue);
}

/**
 * Formats a number to display with the user's preferred decimal separator
 * @param value - The number to format
 * @param useComma - Whether to use comma as decimal separator (default: false)
 * @param decimalPlaces - Number of decimal places to show (default: 2)
 * @returns The formatted string
 */
export function formatDecimal(
  value: number,
  useComma: boolean = false,
  decimalPlaces: number = 2
): string {
  if (isNaN(value)) {
    return "";
  }
  const formatted = value.toFixed(decimalPlaces);
  if (useComma) {
    return formatted.replace(".", ",");
  }
  return formatted;
}

/**
 * Validates if a string can be parsed as a valid decimal number
 * @param value - The string value to validate
 * @returns True if the value is a valid decimal number
 */
export function isValidDecimal(value: string): boolean {
  return !isNaN(parseDecimal(value));
}
