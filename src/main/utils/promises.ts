export const sleep = async (milliseconds: number) => new Promise<void>(resolve => {
  setTimeout(resolve, milliseconds);
});