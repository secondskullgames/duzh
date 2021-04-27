import { PromiseSupplier } from '../types/types';

function chainPromises<T>([first, ...rest]: PromiseSupplier<T>[], input?: T): Promise<any> {
  if (!!first) {
    return first(input).then(output => chainPromises(rest, output));
  }
  return Promise.resolve(input);
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
  wait
};