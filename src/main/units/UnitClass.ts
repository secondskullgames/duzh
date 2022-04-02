import PaletteSwaps from '../graphics/PaletteSwaps';
import { UnitType } from '../types/types';
import AIParameters from './controllers/AIParameters';
import UnitAbility from './UnitAbility';
import UnitModel from './UnitModel';

interface UnitClass {
  readonly name: string;
  readonly sprite: string,
  readonly type: UnitType;
  readonly paletteSwaps: PaletteSwaps;
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
  readonly abilities: Record<number, UnitAbility.Name[]>;
  readonly summonedUnitClass: string | null;
}

const _fromModel = async (model: UnitModel): Promise<UnitClass> => {
  return {
    ...model,
    abilities: model.abilities as Record<number, UnitAbility.Name[]>, // TODO enforce this
    type: model.type as UnitType, // TODO enforce this
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(model.paletteSwaps)
  } as UnitClass;
};

namespace UnitClass {
  export const fromModel = _fromModel;
  export const load = async (unitModelId: string) => _fromModel(await UnitModel.load(unitModelId));
}

export default UnitClass;
