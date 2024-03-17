import { Key } from '@lib/input/inputTypes';

export const isArrowKey = (key: Key): boolean => {
  return ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key);
};

export const isNumberKey = (key: Key): boolean => {
  const abilityKeys: Key[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return abilityKeys.includes(key);
};

export const isModifierKey = (key: Key): boolean => {
  return ['SHIFT', 'ALT', 'CTRL'].includes(key);
};
