function sortBy<T>(list: T[], mapFunction: (t: T) => number) {
  return list.sort((a, b) => mapFunction(a) - mapFunction(b));
}

function average(list: number[]) {
  const sum = list.reduce((a, b) => a + b);
  return sum / list.length;
}

export {
  sortBy,
  average
};