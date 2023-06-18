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
    console.log(`${unit.getName()} dies!`);

    if (randChance(0.25)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, { imageFactory })
      map.addObject(healthGlobe);
    }
  }
};