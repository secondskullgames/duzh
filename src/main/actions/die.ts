import Unit from '../entities/units/Unit';
import { gameOver } from './gameOver';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { logMessage } from './logMessage';
import GameState from '../core/GameState';
import { randChance } from '../utils/random';
import ObjectFactory from '../entities/objects/ObjectFactory';
import ImageFactory from '../graphics/images/ImageFactory';

type Context = Readonly<{
  state: GameState,
  imageFactory: ImageFactory
}>;

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (unit: Unit, { state, imageFactory }: Context) => {
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  const coordinates = unit.getCoordinates();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver({ state });
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    logMessage(`${unit.getName()} dies!`, { state });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, { imageFactory })
      map.addObject(healthGlobe);
    }
  }
};