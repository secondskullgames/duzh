import { gameOver } from './gameOver';
import Sounds from '../sounds/Sounds';
import { Unit } from '@main/entities/units';
import { random } from '@main/utils/random';
import { Session, GameState } from '@main/core';

// TODO this should be enemy-specific? add loot tables
const HEALTH_GLOBE_DROP_CHANCE = 0.25;
const MANA_GLOBE_DROP_CHANCE = 0;

export const die = async (unit: Unit, state: GameState, session: Session) => {
  const playerUnit = session.getPlayerUnit();
  const coordinates = unit.getCoordinates();
  const map = unit.getMap();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver(state, session);
    return;
  } else {
    state.getSoundPlayer().playSound(Sounds.ENEMY_DIES);
    session.getTicker().log(`${unit.getName()} dies!`, { turn: session.getTurn() });

    // TODO make this more systematic
    if (unit.getUnitType() === 'WIZARD') {
      const key = await state.getItemFactory().createMapItem('key', coordinates, map);
      map.addObject(key);
    } else {
      const objectFactory = state.getObjectFactory();
      const randomRoll = random();
      if (randomRoll < HEALTH_GLOBE_DROP_CHANCE) {
        const healthGlobe = await objectFactory.createHealthGlobe(coordinates, map);
        map.addObject(healthGlobe);
      } else if (randomRoll < HEALTH_GLOBE_DROP_CHANCE + MANA_GLOBE_DROP_CHANCE) {
        const manaGlobe = await objectFactory.createManaGlobe(coordinates, map);
        map.addObject(manaGlobe);
      }
    }
  }
};
