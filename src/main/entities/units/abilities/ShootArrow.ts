import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import Sounds from '../../../sounds/Sounds';
import { dealDamage } from '../../../actions/dealDamage';
import { sleep } from '../../../utils/promises';
import { die } from '../../../actions/die';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { getRangedDamage } from '../UnitUtils';
import { isBlocked } from '../../../maps/MapUtils';
import { EquipmentScript } from '../../../equipment/EquipmentScript';
import Direction from '../../../geometry/Direction';
import Activity from '../Activity';

const manaCost = 5;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`;
};

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
