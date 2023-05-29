export const SHORT_SLEEP = 50;
export const MEDIUM_SLEEP = 100;
export const LONG_SLEEP = 150;

export const sleep = async (milliseconds: number): Promise<void> => new Promise<void>(resolve => {
  setTimeout(() => {
    resolve();
  }, milliseconds);
});