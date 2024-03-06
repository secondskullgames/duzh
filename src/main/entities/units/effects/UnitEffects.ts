import { UnitEffect } from '@main/entities/units/effects/UnitEffect';

export class UnitEffects {
  private effects: Partial<Record<UnitEffect, number>> = {};

  addEffect = (type: UnitEffect, turns: number): void => {
    this.effects[type] ??= 0;
    this.effects[type]! += turns;
  };

  removeEffect = (type: UnitEffect): void => {
    delete this.effects[type];
  };

  decrement = (): void => {
    for (const type of Object.keys(this.effects) as UnitEffect[]) {
      this.effects[type]! -= 1;
      if (this.effects[type]! <= 0) {
        delete this.effects[type];
      }
    }
  };

  getEffects = (): UnitEffect[] => {
    return Object.keys(this.effects) as UnitEffect[];
  };

  getDuration = (type: UnitEffect): number => {
    return this.effects[type] ?? 0;
  };

  hasEffect = (type: UnitEffect): boolean => {
    const duration = this.effects[type];
    return duration !== undefined && duration > 0;
  };
}
