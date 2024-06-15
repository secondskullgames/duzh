/** floating point */
export type Seconds = number;

export const formatTimestamp = (elapsedTime: Seconds): string => {
  const minutes = Math.round(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const zeroPad = (val: number) => val.toFixed().padStart(2, '0');
  return `${zeroPad(minutes)}:${zeroPad(seconds)}`;
};
