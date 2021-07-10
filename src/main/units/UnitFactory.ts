import UnitClass from './UnitClass';
import Unit from './Unit';
import { HUMAN_DETERMINISTIC } from './controllers/AIUnitControllers';
import { Coordinates } from '../types/types';
import { randChoice } from '../utils/random';

function createRandomEnemy({ x, y }: Coordinates, level: number): Unit {
  const candidates = UnitClass.getEnemyClasses()
    .filter(unitClass => level >= unitClass.minLevel)
    .filter(unitClass => level <= unitClass.maxLevel);

  const unitClass = randChoice(candidates);
  return new Unit(unitClass, unitClass.name, HUMAN_DETERMINISTIC, level, { x, y });
}

export default {
  createRandomEnemy
};
