import { dealDamage } from './dealDamage';
import { die } from './die';
import Unit from '../units/Unit';
import Sounds from '../sounds/Sounds';
import { Activity } from '../units/Activity';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { sleep } from '@lib/utils/promises';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { Game } from '@main/core/Game';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s fireball hit ${target.getName()} for ${damageTaken} damage!`;
};

export const shootFireball = async (
  unit: Unit,
  direction: Direction,
  damage: number,
  game: Game
) => {
  const { state, session } = game;
  const { dx, dy } = Direction.getOffsets(direction);
  unit.setDirection(direction);

  const map = session.getMap();
  const coordinatesList = [];
  let { x, y } = Coordinates.plusDirection(unit.getCoordinates(), direction);
  while (map.contains({ x, y }) && !isBlocked({ x, y }, map)) {
    coordinatesList.push({ x, y });
    x += dx;
    y += dy;
  }

  const targetUnit = map.getUnit({ x, y });
  if (targetUnit) {
    state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
    await playFireballAnimation(unit, direction, coordinatesList, targetUnit, state);
    const adjustedDamage = await dealDamage(damage, {
      sourceUnit: unit,
      targetUnit
    });
    const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
    session.getTicker().log(message, { turn: session.getTurn() });
    if (targetUnit.getLife() <= 0) {
      await sleep(100);
      await die(targetUnit, game);
    }
  } else {
    await playFireballAnimation(unit, direction, coordinatesList, null, state);
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
  source.setActivity(Activity.SHOOTING, 1, source.getDirection());
  if (target) {
    target.setActivity(Activity.STANDING, 1, target.getDirection());
  }
  await sleep(100);

  const visibleCoordinatesList = coordinatesList.filter(coordinates =>
    map.isTileRevealed(coordinates)
  );

  // fireball movement frames
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
