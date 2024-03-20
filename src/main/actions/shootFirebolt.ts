import { dealDamage } from './dealDamage';
import { die } from './die';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import Activity from '../units/Activity';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { sleep } from '@lib/utils/promises';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s firebolt hit ${target.getName()} for ${damageTaken} damage!`;
};

export const shootFirebolt = async (
  unit: Unit,
  direction: Direction,
  damage: number,
  burnDuration: number,
  session: Session,
  state: GameState
) => {
  const { dx, dy } = direction;
  unit.setDirection(direction);

  const map = session.getMap();
  const coordinatesList = [];
  let { x, y } = Coordinates.plus(unit.getCoordinates(), direction);
  while (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
    coordinatesList.push({ x, y });
    x += dx;
    y += dy;
  }

  const targetUnit = map.getUnit({ x, y });
  if (targetUnit) {
    state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
    await playFireboltAnimation(unit, { dx, dy }, coordinatesList, targetUnit, state);
    const adjustedDamage = await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit
    });
    const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
    session.getTicker().log(message, { turn: session.getTurn() });
    if (targetUnit.getLife() <= 0) {
      await sleep(100);
      await die(targetUnit, state, session);
    } else {
      targetUnit.setBurning(burnDuration);
      session
        .getTicker()
        .log(`${targetUnit.getName()} is burned!`, { turn: session.getTurn() });
    }
  } else {
    await playFireboltAnimation(unit, { dx, dy }, coordinatesList, null, state);
  }
};

/**
 * TODO: fully copy-pasted from ShootArrow
 * Probably want to extract a shared `shootArrow` action
 * Still better than using AnimationFactory
 */
const playFireboltAnimation = async (
  source: Unit,
  direction: Direction,
  coordinatesList: Coordinates[],
  target: Unit | null,
  state: GameState
) => {
  const map = source.getMap();

  // first frame
  source.setActivity(Activity.SHOOTING, 1, source.getDirection());
  if (target) {
    target.setActivity(Activity.STANDING, 1, target.getDirection());
  }
  await sleep(100);

  const visibleCoordinatesList = coordinatesList.filter(coordinates =>
    map.isTileRevealed(coordinates)
  );

  // firebolt movement frames
  for (const coordinates of visibleCoordinatesList) {
    const projectile = await state
      .getProjectileFactory()
      .createFireball(coordinates, map, direction);
    map.addProjectile(projectile);
    await sleep(50);
    map.removeProjectile(projectile);
  }

  // last frames
  if (target) {
    target.getEffects().addEffect(StatusEffect.DAMAGED, 1);
    await sleep(100);
  }

  source.setActivity(Activity.STANDING, 1, source.getDirection());
  if (target) {
    target.getEffects().removeEffect(StatusEffect.DAMAGED);
    target.setActivity(Activity.STANDING, 1, target.getDirection());
  }
};
