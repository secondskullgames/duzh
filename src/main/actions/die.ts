import Unit from '../entities/units/Unit';
import { gameOver } from './gameOver';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { randChance } from '../utils/random';
import ObjectFactory from '../entities/objects/ObjectFactory';
import { GlobalContext } from '../core/GlobalContext';

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (
  unit: Unit,
  { state, imageFactory, ticker }: GlobalContext
) => {
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  const coordinates = unit.getCoordinates();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver({ state });
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    ticker.log(`${unit.getName()} dies!`, { turn: state.getTurn() });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, { imageFactory })
      map.addObject(healthGlobe);
    }
  }
};