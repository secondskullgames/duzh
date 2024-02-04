import { gameOver } from './gameOver';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { randChance } from '../utils/random';
import ObjectFactory from '../entities/objects/ObjectFactory';
import MapInstance from '../maps/MapInstance';
import ItemFactory from '../items/ItemFactory';
import { Session } from '../core/Session';

type Context = Readonly<{
  session: Session;
  map: MapInstance;
}>;

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (unit: Unit, { session, map }: Context) => {
  const playerUnit = session.getPlayerUnit();
  const coordinates = unit.getCoordinates();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver(session);
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    session.getTicker().log(`${unit.getName()} dies!`, { turn: session.getTurn() });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await ObjectFactory.createHealthGlobe(coordinates, {
        imageFactory: session.getImageFactory()
      });
      map.addObject(healthGlobe);
    }

    // TODO make this more systematic
    if (unit.getUnitType() === 'WIZARD') {
      const key = await ItemFactory.createMapItem('key', coordinates, {
        imageFactory: session.getImageFactory()
      });
      map.addObject(key);
    }
  }
};
