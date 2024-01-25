export const checkArgument = (condition: boolean, message: string | null = null) => {
  if (!condition) {
    throw new Error(message ? `Illegal argument: ${message}` : 'Illegal argument');
  }
};

export const checkState = (condition: boolean, message: string | null = null) => {
  if (!condition) {
    throw new Error(message ? `Illegal state: ${message}` : 'Illegal state');
  }
};

export const checkNotNull = <T>(
  value: T | null | undefined,
  message: string | null = null
): T => {
  if (value === null || value === undefined) {
    throw new Error(
      message
        ? `Unexpected null or undefined value: ${message}`
        : 'Unexpected null or undefined value'
    );
  }
  return value;
};

/**
 * Half-baked attempt to combine the above
 */
export const check = <T>(value: T | null | undefined, message?: string): T => {
  if (!value) {
    throw new Error(message ? `Unexpected value: ${message}` : 'Unexpected value');
  }
  return value;
};
