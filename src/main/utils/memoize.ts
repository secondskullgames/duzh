type ValueSupplier<T> = (key: string) => T;

const memoize = <T>(supplier: ValueSupplier<T>): ValueSupplier<T> => {
  const memos: Record<string, T> = {};

  return (key: string) => {
    if (memos[key] !== undefined) {
      return memos[key];
    }

    const value = supplier(key);
    memos[key] = value;
    return value;
  };
};

export default memoize;
