function sortBy<T>(list: T[], mapFunction: (t: T) => number) {
  return list.sort((a, b) => mapFunction(a) - mapFunction(b));
}

function sortByReversed<T>(list: T[], mapFunction: (t: T) => number) {
  return list.sort((a, b) => mapFunction(b) - mapFunction(a));
}

function comparing<T>(mapFunction: (t: T) => number) {
  return (a: T, b: T) => mapFunction(a) - mapFunction(b);
}

function comparingReversed<T>(mapFunction: (t: T) => number) {
  return (a: T, b: T) => mapFunction(b) - mapFunction(a);
}

function average(list: number[]) {
  const sum = list.reduce((a, b) => a + b);
  return sum / list.length;
}

export {
  sortBy,
  sortByReversed,
  comparing,
  comparingReversed,
  average
};