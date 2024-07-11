import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Sounds from '@main/sounds/Sounds';
import { Activity } from '@main/units/Activity';
import Unit from '@main/units/Unit';
import { getRangedDamage } from '@main/units/UnitUtils';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { pointAt } from '@lib/geometry/CoordinatesUtils';
import { dealDamage } from '@main/actions/dealDamage';
import { sleep } from '@lib/utils/promises';
import { die } from '@main/actions/die';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { EquipmentSlot } from '@models/EquipmentSlot';

const manaCost = 5;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`;
};

export const ShootArrow: UnitAbility = {
  name: AbilityName.SHOOT_ARROW,
  icon: 'harpoon_icon',
  manaCost,
  innate: true,
  isEnabled: unit =>
    unit.getMana() >= manaCost &&
    unit.getEquipment().getBySlot(EquipmentSlot.RANGED_WEAPON) !== null,
  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    if (!unit.getEquipment().getBySlot(EquipmentSlot.RANGED_WEAPON)) {
      throw new Error('ShootArrow requires a ranged weapon!');
    }

    const map = session.getMap();
    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    unit.spendMana(manaCost);

    const coordinatesList = [];
    let { x, y } = Coordinates.plusDirection(unit.getCoordinates(), direction);
    const { dx, dy } = Direction.getOffsets(direction);
    while (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      const damage = getRangedDamage(unit);
      await playArrowAnimation(unit, direction, coordinatesList, targetUnit, state);
      state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
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
        for (const equipment of unit.getEquipment().getAll()) {
          if (equipment.script) {
            await EquipmentScript.forName(equipment.script).afterRangedAttack?.(
              equipment,
              targetUnit.getCoordinates(),
              state,
              session
            );
          }
        }
      }
    } else {
      await playArrowAnimation(unit, direction, coordinatesList, null, state);
    }
  }
};

const playArrowAnimation = async (
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
    target.setActivity(Activity.STANDING, 1, target.getDirection());
    target.getEffects().removeEffect(StatusEffect.DAMAGED);
  }
};
