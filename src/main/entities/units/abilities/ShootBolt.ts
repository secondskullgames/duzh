import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '../../../sounds/Sounds';
import { dealDamage } from '@main/actions/dealDamage';
import { sleep } from '@main/utils/promises';
import { die } from '@main/actions/die';
import { Session, GameState } from '@main/core';
import { isBlocked } from '@main/maps/MapUtils';
import { Coordinates, Direction, pointAt } from '@main/geometry';
import { Activity, getMeleeDamage, Unit } from '@main/entities/units';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s bolt hit ${target.getName()} for ${damageTaken} damage!`;
};

export const ShootBolt: UnitAbility = {
  name: AbilityName.BOLT,
  icon: null,
  manaCost: 0,
  innate: false,

  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    const map = session.getMap();
    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    // unit.spendMana(0); // TODO

    const coordinatesList = [];
    let { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    while (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      const damage = getMeleeDamage(unit);
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
      await playBoltAnimation(unit, { dx, dy }, coordinatesList, targetUnit, state);
      state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
      session.getTicker().log(message, { turn: session.getTurn() });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, state, session);
      }
    } else {
      await playBoltAnimation(unit, { dx, dy }, coordinatesList, null, state);
    }
  }
};

/**
 * TODO: fully copy-pasted from ShootArrow
 * Probably want to extract a shared `shootArrow` action
 * Still better than using AnimationFactory
 */
const playBoltAnimation = async (
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
    target.setActivity(Activity.DAMAGED, 1, target.getDirection());
    await sleep(100);
  }
  source.setActivity(Activity.STANDING, 1, source.getDirection());
  if (target) {
    target.setActivity(Activity.STANDING, 1, target.getDirection());
  }
};
