import { recordKill } from './recordKill';
import { die } from './die';
import { dealDamage } from './dealDamage';
import Unit from '../entities/units/Unit';
import { playAnimation } from '../graphics/animations/playAnimation';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import { GameState } from '../core/GameState';
import { Session } from '../core/Session';

export const floorFire = async (
  unit: Unit,
  damage: number,
  state: GameState,
  session: Session
) => {
  const map = unit.getMap();
  // TODO - optimization opportunity
  const adjacentUnits: Unit[] = map.getAllUnits().filter(u => {
    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), u.getCoordinates());
    return [-1, 0, 1].includes(dx) && [-1, 0, 1].includes(dy) && !(dx === 0 && dy === 0);
  });

  state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
  const animation = await state
    .getAnimationFactory()
    .getFloorFireAnimation(unit, adjacentUnits);
  await playAnimation(animation, { map });

  for (const adjacentUnit of adjacentUnits) {
    await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit: adjacentUnit
    });

    if (adjacentUnit.getLife() <= 0) {
      await die(adjacentUnit, state, session);
      recordKill(unit, adjacentUnit, session, state);
    }
  }
};
