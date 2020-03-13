function resolvedPromise(value?: any): Promise<any> {
  return new Promise(resolve => resolve(value));
}

type PromiseSupplier<T> = (t?: T) => Promise<T>

function chainPromises<T>([first, ...rest]: PromiseSupplier<T>[], input?: T): Promise<any> {
  if (!!first) {
    return first(input).then(output => chainPromises(rest, output));
  }
  return resolvedPromise(input);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

export {
  chainPromises,
  resolvedPromise,
  wait
};