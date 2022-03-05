import { checkState } from './preconditions';

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

const min = (list: number[]): number => Math.min(...list);
const max = (list: number[]): number => Math.max(...list);

const minBy = <T> (list: T[], keyFunction: (t: T) => number): T => {
  checkState(list.length > 0);
  return sortBy(list, keyFunction)[0];
};

const maxBy = <T> (list: T[], keyFunction: (t: T) => number): T => {
  checkState(list.length > 0);
  return sortBy(list, keyFunction)[list.length - 1];
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
 * @param max inclusive
 */
const range = (min: number, max: number) => new Array(max - min + 1)
  .fill(null)
  .map((_, i) => i + min);

const head = <T> (array: T[], count: number): T[] => array.slice(0, count);
const tail = <T> (array: T[], count: number): T[] => array.slice(-count);

const sum = (array: number[]) => array.reduce((a, b) => a + b);

export {
  average,
  clear,
  comparing,
  comparingReversed,
  head,
  max,
  maxBy,
  min,
  minBy,
  range,
  replace,
  sortBy,
  sortByReversed,
  subtract,
  sum,
  tail
};
