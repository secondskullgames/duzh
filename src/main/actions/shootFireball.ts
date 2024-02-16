import { dealDamage } from './dealDamage';
import { die } from './die';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Sounds from '../sounds/Sounds';
import { playAnimation } from '../graphics/animations/playAnimation';
import { sleep } from '../utils/promises';
import Direction from '../geometry/Direction';
import { Session } from '../core/Session';
import { GameState } from '../core/GameState';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s fireball hit ${target.getName()} for ${damageTaken} damage!`;
};

export const shootFireball = async (
  unit: Unit,
  direction: Direction,
  damage: number,
  session: Session,
  state: GameState
) => {
  const { dx, dy } = direction;
  unit.setDirection(direction);

  const map = session.getMap();
  const coordinatesList = [];
  let { x, y } = Coordinates.plus(unit.getCoordinates(), direction);
  while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
    coordinatesList.push({ x, y });
    x += dx;
    y += dy;
  }

  const targetUnit = map.getUnit({ x, y });
  if (targetUnit) {
    state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
    const fireballAnimation = await state
      .getAnimationFactory()
      .getFireballAnimation(unit, { dx, dy }, coordinatesList, targetUnit, map);
    await playAnimation(fireballAnimation, { map });
    const adjustedDamage = await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit
    });
    const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
    session.getTicker().log(message, { turn: session.getTurn() });
    if (targetUnit.getLife() <= 0) {
      await sleep(100);
      await die(targetUnit, state, session);
    }
  } else {
    const fireballAnimation = await state
      .getAnimationFactory()
      .getFireballAnimation(unit, direction, coordinatesList, null, map);
    await playAnimation(fireballAnimation, { map });
  }
};
