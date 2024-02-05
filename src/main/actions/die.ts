import { gameOver } from './gameOver';
import Unit from '../entities/units/Unit';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import { randChance } from '../utils/random';
import { Session } from '../core/Session';
import { GameState } from '../core/GameState';

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;

export const die = async (unit: Unit, state: GameState, session: Session) => {
  const playerUnit = session.getPlayerUnit();
  const coordinates = unit.getCoordinates();
  const map = unit.getMap();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver(session);
    return;
  } else {
    playSound(Sounds.ENEMY_DIES);
    session.getTicker().log(`${unit.getName()} dies!`, { turn: session.getTurn() });

    if (randChance(HEALTH_GLOBE_DROP_CHANCE)) {
      const healthGlobe = await state
        .getObjectFactory()
        .createHealthGlobe(coordinates, map);
      map.addObject(healthGlobe);
    }

    // TODO make this more systematic
    if (unit.getUnitType() === 'WIZARD') {
      const key = await state.getItemFactory().createMapItem('key', coordinates, map);
      map.addObject(key);
    }
  }
};
