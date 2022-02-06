type KeyFunction<T> = (t: T) => number;

const sortBy = <T>(list: T[], keyFunction: KeyFunction<T>) =>
  list.sort((a, b) => keyFunction(a) - keyFunction(b));

const sortByReversed = <T>(list: T[], keyFunction: KeyFunction<T>) =>
  list.sort((a, b) => keyFunction(b) - keyFunction(a));

const comparing = <T>(keyFunction: KeyFunction<T>) =>
  (a: T, b: T) => keyFunction(a) - keyFunction(b);

const comparingReversed = <T>(keyFunction: KeyFunction<T>) =>
  (a: T, b: T) => keyFunction(b) - keyFunction(a);

const average = (list: number[]) => {
  const sum = list.reduce((a, b) => a + b);
  return sum / list.length;
};

const replace = <T>(array: T[], contents: T[]) => {
  clear(array);
  array.push(...contents);
};

const subtract = <T>(array: T[], toRemove: T[]) => {
  const updated = array.filter(element => toRemove.indexOf(element) === -1);
  replace(array, updated);
};

const clear = (array: any[]) => {
  array.splice(0, array.length);
};

/**
 * @param max exclusive
 */
const range = (min: number, max: number) => new Array(max - min)
  .fill(null)
  .map((_, i) => i + min);

export {
  average,
  clear,
  comparing,
  comparingReversed,
  range,
  replace,
  sortBy,
  sortByReversed,
  subtract
};
