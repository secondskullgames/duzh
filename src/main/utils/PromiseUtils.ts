function resolvedPromise(value?: any): Promise<any> {
  return new Promise(resolve => resolve(value));
}

function chainPromises<T>([first, ...rest]: ((t: T) => Promise<T>)[], input?: T): Promise<any> {
  if (!!first) {
    return first(input).then(output => chainPromises(rest, output));
  }
  return resolvedPromise(input);
}

export {
  chainPromises,
  resolvedPromise
};