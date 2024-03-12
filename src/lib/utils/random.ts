import { head } from '@lib/utils/arrays';
import { checkNotNull } from '@lib/utils/preconditions';

/**
 * @param max inclusive
 */
export const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);
export const randBoolean = () => randInt(0, 1) === 1;
export const random = () => Math.random();
export const randChance = (chance: number) => Math.random() <= chance;

export const randChoice = <T>(list: T[]): T =>
  checkNotNull(list[randInt(0, list.length - 1)]);

/**
 * Fisher-Yates.  Stolen from https://bost.ocks.org/mike/shuffle/
 */
export const shuffle = <T>(list: T[]) => {
  let n = list.length;

  // While there remain elements to shuffle...
  while (n > 0) {
    // Pick a remaining element...
    const i = randInt(0, n - 1);
    n--;

    // And swap it with the current element.
    const tmp = list[n];
    list[n] = list[i];
    list[i] = tmp;
  }
};

export type WeightedRandomChoice<T> = Readonly<{ key: string; weight: number; value: T }>;

export const weightedRandom = <T>(choices: WeightedRandomChoice<T>[]): T => {
  const probabilities: Record<string, number> = {};
  const mappedObjects: Record<string, T> = {};
  for (const choice of choices) {
    probabilities[choice.key] = choice.weight;
    mappedObjects[choice.key] = choice.value;
  }
  const total = Object.values(probabilities).reduce((a, b) => a + b);
  const rand = Math.random() * total;
  let counter = 0;
  const entries = Object.entries(probabilities);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    counter += value;
    if (counter > rand) {
      return mappedObjects[key];
    }
  }

  // unreachable unless programmer error
  throw new Error('Error in weightedRandom()!');
};

/**
 * TODO: not Fisher-Yates, whatever
 * TODO: undefined behavior if length < count
 */
export const sample = <T>(list: T[], count?: number): T[] => {
  const shuffled = [...list];
  shuffle(shuffled);
  if (count === undefined) {
    count = randInt(1, list.length - 1);
  }
  return head(shuffled, count);
};
