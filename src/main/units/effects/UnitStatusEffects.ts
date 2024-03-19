import { StatusEffect } from '@main/units/effects/StatusEffect';

export class UnitStatusEffects {
  private effects: Partial<Record<StatusEffect, number>> = {};

  addEffect = (type: StatusEffect, turns: number): void => {
    this.effects[type] ??= 0;
    this.effects[type]! += turns;
  };

  removeEffect = (type: StatusEffect): void => {
    delete this.effects[type];
  };

  decrement = (): void => {
    for (const type of Object.keys(this.effects) as StatusEffect[]) {
      this.effects[type]! -= 1;
      if (this.effects[type]! <= 0) {
        delete this.effects[type];
      }
    }
  };

  getEffects = (): StatusEffect[] => {
    return Object.keys(this.effects) as StatusEffect[];
  };

  getDuration = (type: StatusEffect): number => {
    return this.effects[type] ?? 0;
  };

  hasEffect = (type: StatusEffect): boolean => {
    const duration = this.effects[type];
    return duration !== undefined && duration > 0;
  };
}
