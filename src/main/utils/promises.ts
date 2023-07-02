export const SHORT_SLEEP = 75;
export const MEDIUM_SLEEP = 150;
export const LONG_SLEEP = 225;

export const sleep = async (milliseconds: number): Promise<void> => new Promise<void>(resolve => {
  const start = performance.now();
  setTimeout(() => {
    const end = performance.now();
    console.log(`Sleep(${milliseconds}) took: ${end - start} ms`);
    resolve();
  }, milliseconds);
});