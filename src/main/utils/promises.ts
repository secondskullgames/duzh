export const sleep = async (milliseconds: number): Promise<void> => new Promise<void>(resolve => {
  const start = performance.now();
  setTimeout(() => {
    const end = performance.now();
    console.log(`Sleep(${milliseconds}) took: ${end - start} ms`);
    resolve();
  }, milliseconds);
});