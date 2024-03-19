import { gameOver } from './gameOver';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { random } from '@lib/utils/random';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { UnitType } from '@models/UnitType';

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
    if (unit.getUnitType() === UnitType.WIZARD) {
      const key = await state.getItemFactory().createMapItem('key', coordinates, map);
      map.addObject(key);
    } else {
      if (_canDropGlobes(unit)) {
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
  }
};

const _canDropGlobes = (unit: Unit): boolean => {
  return !!unit.getExperienceRewarded();
};
