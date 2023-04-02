export const checkArgument = (condition: boolean, message: string | null = null) => {
  if (!condition) {
    throw new Error(message ? `Illegal argument: ${message}` : 'Illegal state');
  }
};

export const checkState = (condition: boolean, message: string | null = null) => {
  if (!condition) {
    throw new Error(message ? `Illegal state: ${message}` : 'Illegal state');
  }
};

export const checkNotNull = <T> (value: T | null | undefined, message: string | null = null): T => {
  if (value === null || value === undefined) {
    throw new Error(message ? `Unexpected null or undefined value: ${message}` : 'Unexpected null or undefined value');
  }
  return value;
};
