import grunt from '../../../data/units/grunt.json';
import player from '../../../data/units/player.json';
import snake from '../../../data/units/snake.json';
import soldier from '../../../data/units/soldier.json';
import golem from '../../../data/units/golem.json';
import PaletteSwaps from '../types/PaletteSwaps';
import { UnitType } from '../types/types';

interface UnitClass {
  readonly name: string;
  readonly sprite: string,
  readonly type: UnitType;
  readonly paletteSwaps: PaletteSwaps;
  readonly startingLife: number;
  readonly startingMana: number | null;
  readonly startingDamage: number;
  readonly minLevel: number;
  readonly maxLevel: number;
  readonly lifePerLevel: number;
  readonly manaPerLevel: number | null;
  readonly damagePerLevel: number;
  readonly equipment?: string[];

  // TODO move these somewhere else
  readonly experienceToNextLevel?: number[];
  readonly aiParameters?: AIParameters;
}

const _load = (json: any): UnitClass => {
  return <UnitClass>{
    ...json,
    // We're using "friendly" color names, convert them to hex now
    paletteSwaps: PaletteSwaps.create(json.paletteSwaps),
  };
};

const _enemyClasses: UnitClass[] = [grunt, golem, soldier, snake].map(json => _load(json));

namespace UnitClass {
  export const PLAYER: UnitClass = _load(player);

  export const getEnemyClasses = (): UnitClass[] => {
    return _enemyClasses;
  };

  export const load = _load;
}

export default UnitClass;
