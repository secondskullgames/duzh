type Supplier<T> = (key: string) => T;

const memoize = <T>(supplier: Supplier<T>): ((key: string) => T) => {
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
