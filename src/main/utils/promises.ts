export const SHORT_SLEEP = 100;
export const LONG_SLEEP = 300;

export const sleep = async (milliseconds: number): Promise<void> => new Promise<void>(resolve => {
  const start = performance.now();
  setTimeout(() => {
    const end = performance.now();
    console.log(`Sleep(${milliseconds}) took: ${end - start} ms`);
    resolve();
  }, milliseconds);
});