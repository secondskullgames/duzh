/**
 * similar to Java's Collectors.toMap()
 */
const toRecord = <T, K extends string | number, V> (list: T[], keyFunction: (t: T) => K, valueFunction: (t: T) => V): Record<K, V> => {
  const record: Partial<Record<K, V>> = {};
  for (const item of list) {
    record[keyFunction(item)] = valueFunction(item);
  }
  return record as Record<K, V>;
};

export {
  toRecord
};
