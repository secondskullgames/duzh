import { UnitModel } from '../../gen-schema/unit.schema';
import PaletteSwaps from '../graphics/PaletteSwaps';
import { UnitType } from '../types/types';
import memoize from '../utils/memoize';
import { loadModel } from '../utils/models';
import AIParameters from './controllers/AIParameters';
import UnitAbility from './UnitAbility';

interface UnitClass {
  readonly name: string;
  readonly sprite: string,
  readonly type: UnitType;
  readonly paletteSwaps: PaletteSwaps;
  readonly life: number;
  readonly mana: number;
  readonly damage: number;
  readonly level: number | null;
  readonly points: number | null;
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

const _loadAll = async (): Promise<UnitClass[]> => {
  const requireContext = require.context(
    '../../../data/units',
    false,
    /\.json$/i
  );

  return Promise.all(
    requireContext.keys()
      .map(filename => requireContext(filename) as UnitModel)
      .map(_fromModel)
  );
};

namespace UnitClass {
  export const fromModel = _fromModel;
  export const load = async (id: string) => _fromModel(await loadModel(`units/${id}`, 'unit'));
  export const loadAll = _loadAll;
}

export default UnitClass;
