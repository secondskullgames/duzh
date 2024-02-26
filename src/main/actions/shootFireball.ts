import { dealDamage } from './dealDamage';
import { die } from './die';
import Unit from '../entities/units/Unit';
import Coordinates from '../geometry/Coordinates';
import Sounds from '../sounds/Sounds';
import { sleep } from '../utils/promises';
import Direction from '../geometry/Direction';
import { Session } from '../core/Session';
import { GameState } from '../core/GameState';
import { isBlocked } from '../maps/MapUtils';
import Activity from '../entities/units/Activity';

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
  while (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
    coordinatesList.push({ x, y });
    x += dx;
    y += dy;
  }

  const targetUnit = map.getUnit({ x, y });
  if (targetUnit) {
    state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
    await playFireballAnimation(unit, { dx, dy }, coordinatesList, targetUnit, state);
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
    await playFireballAnimation(unit, { dx, dy }, coordinatesList, null, state);
  }
};

/**
 * TODO: fully copy-pasted from ShootArrow
 * Probably want to extract a shared `shootArrow` action
 * Still better than using AnimationFactory
 */
const playFireballAnimation = async (
  source: Unit,
  direction: Direction,
  coordinatesList: Coordinates[],
  target: Unit | null,
  state: GameState
) => {
  const map = source.getMap();

  // first frame
  source.setActivity(Activity.SHOOTING, 0, source.getDirection());
  if (target) {
    target.setActivity(Activity.STANDING, 0, target.getDirection());
  }
  await sleep(100);

  const visibleCoordinatesList = coordinatesList.filter(coordinates =>
    map.isTileRevealed(coordinates)
  );

  // arrow movement frames
  for (const coordinates of visibleCoordinatesList) {
    const projectile = await state
      .getProjectileFactory()
      .createArrow(coordinates, map, direction);
    map.projectiles.add(projectile);
    await sleep(50);
    map.removeProjectile(projectile);
  }

  // last frames
  if (target) {
    target.setActivity(Activity.DAMAGED, 0, target.getDirection());
    await sleep(100);
  }
  source.setActivity(Activity.STANDING, 0, source.getDirection());
  if (target) {
    target.setActivity(Activity.STANDING, 0, target.getDirection());
  }
};
