import { checkNotNull } from './preconditions';

class Subtimer {
  startTime: number;
  lastTime: number;
  ticks: number;

  constructor() {
    this.startTime = new Date().getTime();
    this.lastTime = this.startTime;
    this.ticks = 0;
  }
}

export default class Timer {
  private readonly subtimers: {
    [label: string]: Subtimer
  };
  /** millis */

  private constructor() {
    this.subtimers = {};
  }

  start = (label: string) => {
    this.subtimers[label] = new Subtimer();
  };

  log = (label: string) => {
    const subtimer = checkNotNull(this.subtimers[label]);
    const { startTime, lastTime, ticks } = subtimer;
    const now = new Date().getTime();
    const elapsedMillis = now - startTime;
    const averageMillis = elapsedMillis / ticks;
    console.log(`${label} time: ${now - lastTime} ms (average: ${averageMillis.toFixed(2)} ms)`);
    subtimer.lastTime = now;
    subtimer.ticks++;
  };

  getElapsedMillis = (label: string): number => {
    const now = new Date().getTime();
    const subtimer = checkNotNull(this.subtimers[label]);
    return now - subtimer.startTime;
  };

  getAverageMillis = (label: string): number => {
    const now = new Date().getTime();
    const subtimer = checkNotNull(this.subtimers[label]);
    return (now - subtimer.startTime) / subtimer.ticks;
  };

  static start = (): Timer => {
    return new Timer();
  };
}