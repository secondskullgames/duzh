export enum StatusEffect {
  STUNNED = 'STUNNED',
  BURNING = 'BURNING',
  FROZEN = 'FROZEN',
  SHOCKED = 'SHOCKED',
  DAMAGED = 'DAMAGED',
  OVERDRIVE = 'OVERDRIVE'
}

export namespace StatusEffect {
  export const toString = (statusEffect: StatusEffect): string => {
    return statusEffect.toLowerCase();
  };
}
