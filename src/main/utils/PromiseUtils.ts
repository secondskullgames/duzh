function resolvedPromise(value?: any): Promise<any> {
  return new Promise(resolve => resolve(value));
}

function chainPromises([first, ...rest]: (() => Promise<any>)[]) {
  if (!!first) {
    return first().then(() => chainPromises(rest));
  }
  return resolvedPromise();
}

export {
  chainPromises,
  resolvedPromise
};