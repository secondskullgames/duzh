import { Coordinates } from '../types/types';
import UnitClasses from './UnitClasses';
import { randChoice } from '../utils/RandomUtils';
import Unit from './Unit';

function createRandomEnemy({ x, y }: Coordinates, level: number): Unit {
  const candidates = UnitClasses.getEnemyClasses()
    .filter(unitClass => level >= unitClass.minLevel)
    .filter(unitClass => level <= unitClass.maxLevel);

  const unitClass = randChoice(candidates);
  return new Unit(unitClass, unitClass.name, level, { x, y });
}

export default {
  createRandomEnemy
};