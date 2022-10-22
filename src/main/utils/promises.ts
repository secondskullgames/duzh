const sleep = async (milliseconds: number): Promise<void> => new Promise<void>(resolve => {
  setTimeout(() => {
    resolve();
  }, milliseconds);
});

export {
  sleep
};
