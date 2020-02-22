import { Coordinates } from './types';
import UnitClasses from './UnitClasses';
import { randChoice } from './utils/RandomUtils';
import Unit from './classes/Unit';

function createRandomEnemy({ x, y }: Coordinates, level: number): Unit {
  const candidates = UnitClasses.getEnemyClasses()
    .filter(unitClass => unitClass.minLevel <= level)
    .filter(unitClass => unitClass.maxLevel >= level);

  const unitClass = randChoice(candidates);
  return new Unit(unitClass, unitClass.name, level, { x, y });
}

export default {
  createRandomEnemy
};