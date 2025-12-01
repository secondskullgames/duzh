import { ArrowKey, Key, ModifierKey, NumberKey } from '@main/input/inputTypes';

export const isArrowKey = (key: Key | null | undefined): key is ArrowKey => {
  return !!key && ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key);
};

export const isNumberKey = (key: Key): key is NumberKey => {
  const abilityKeys: Key[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return abilityKeys.includes(key);
};

export const getNumberKeyValue = (key: NumberKey): number => {
  return parseInt(key);
};

export const isModifierKey = (key: Key): key is ModifierKey => {
  return ['SHIFT', 'ALT', 'CTRL'].includes(key);
};
