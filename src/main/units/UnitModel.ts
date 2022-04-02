import AIParameters from './controllers/AIParameters';

type UnitModel = {
  readonly name: string;
  readonly sprite: string,
  readonly type: string; // should be a UnitType
  readonly paletteSwaps: Record<string, string>;
  readonly startingLife: number;
  readonly startingMana: number | null;
  readonly startingDamage: number;
  readonly lifePerLevel: number;
  readonly manaPerLevel: number | null;
  readonly damagePerLevel: number;
  readonly equipment?: string[];
  readonly experienceToNextLevel?: number[];
  readonly aiParameters?: AIParameters;
  /**
   * TODO: This includes ATTACK at position 0, followed by special abilities.
   * It doesn't include SHOOT_ARROW.
   */
  readonly abilities: Record<number, string[]>;
  readonly summonedUnitClass: string | null;
}

const _load = async (name: string): Promise<UnitModel> => (await import(
  /* webpackMode: "eager" */
  `../../../data/units/${name}.json`
)).default;

namespace UnitModel {
  export const load = _load;
}

export default UnitModel;
