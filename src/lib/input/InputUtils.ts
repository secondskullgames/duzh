import { Key } from '@lib/input/inputTypes';

export const isArrowKey = (key: Key) => {
  return ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key);
};

export const isNumberKey = (key: Key) => {
  const abilityKeys: Key[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return abilityKeys.includes(key);
};
