import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import Sounds from '../../../sounds/Sounds';
import { getRangedDamage } from '../UnitUtils';
import Direction from '../../../geometry/Direction';
import Activity from '../Activity';
import { pointAt } from '@main/geometry/CoordinatesUtils';
import { dealDamage } from '@main/actions/dealDamage';
import { sleep } from '@main/utils/promises';
import { die } from '@main/actions/die';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { isBlocked } from '@main/maps/MapUtils';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { EventType } from '@main/core/EventLog';

const manaCost = 5;

export const ShootArrow: UnitAbility = {
  name: AbilityName.SHOOT_ARROW,
  icon: null,
  manaCost,
  innate: true,

  use: async (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => {
    if (!unit.getEquipment().getBySlot('RANGED_WEAPON')) {
      throw new Error('ShootArrow requires a ranged weapon!');
    }

    const map = session.getMap();
    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    unit.spendMana(manaCost);

    const coordinatesList = [];
    let { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    while (map.contains({ x, y }) && !isBlocked(map, { x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      const damage = getRangedDamage(unit);
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit, state);
      state.getSoundPlayer().playSound(Sounds.PLAYER_HITS_ENEMY);
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = `${unit.getName()}'s arrow hit ${targetUnit.getName()} for ${adjustedDamage} damage!`;
      state.getEventLog().log({
        type: EventType.COMBAT_DAMAGE,
        message,
        sessionId: session.id,
        turn: session.getTurn(),
        timestamp: new Date(),
        coordinates: targetUnit.getCoordinates()
      });
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
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null, state);
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
