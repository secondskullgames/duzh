const wait = async (milliseconds: number): Promise<void> =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });

export {
  wait
};
