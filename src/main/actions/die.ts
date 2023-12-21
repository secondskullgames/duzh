import { gameOver } from './gameOver';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import GameState from '../core/GameState';
import { randChance } from '../utils/random';
import ObjectFactory from '../entities/objects/ObjectFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import MapInstance from '../maps/MapInstance';
import ItemFactory from '../items/ItemFactory';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  session: Session;
  map: MapInstance;
  imageFactory: ImageFactory;
}>;

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (unit: Unit, { state, session, map, imageFactory }: Context) => {
  const playerUnit = state.getPlayerUnit();
  const coordinates = unit.getCoordinates();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver({ state });
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    session.getTicker().log(`${unit.getName()} dies!`, { turn: state.getTurn() });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, {
        imageFactory
      });
      map.addObject(healthGlobe);
    }

    // TODO make this more systematic
    if (unit.getUnitType() === 'WIZARD') {
      const key = await ItemFactory.createMapItem('key', coordinates, { imageFactory });
      map.addObject(key);
    }
  }
};
