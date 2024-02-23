import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { moveUnit } from '../../../actions/moveUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import Sounds from '../../../sounds/Sounds';
import { dealDamage } from '../../../actions/dealDamage';
import { sleep } from '../../../utils/promises';
import { die } from '../../../actions/die';
import Direction from '../../../geometry/Direction';

const manaCost = 5;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`;
};

export const StrafeShot: UnitAbility = {
  name: AbilityName.STRAFE_SHOT,
  manaCost,
  icon: 'icon5', // TODO

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      console.error('Strafe requires a target!');
      return false;
    }
    if (!unit.getEquipment().getBySlot('RANGED_WEAPON')) {
      console.error('ShootArrow requires a ranged weapon!');
      return false;
    }

    const map = session.getMap();
    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await moveUnit(unit, coordinates, session, state);
      unit.spendMana(manaCost);
      await _shootArrow(unit, unit.getDirection(), session, state);
    }
    return true;
  }
};

/** 90% copy-pasted from ShootArrow */
const _shootArrow = async (
  unit: Unit,
  direction: Direction,
  session: Session,
  state: GameState
) => {
  const map = session.getMap();
  const { dx, dy } = direction;

  const coordinatesList = [];
  let { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
  while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
    coordinatesList.push({ x, y });
    x += dx;
    y += dy;
  }

  const targetUnit = map.getUnit({ x, y });
  const animationFactory = state.getAnimationFactory();
  if (targetUnit) {
    const damage = unit.getRangedDamage();
    const arrowAnimation = await animationFactory.getArrowAnimation(
      unit,
      { dx, dy },
      coordinatesList,
      targetUnit,
      map
    );
    await playAnimation(arrowAnimation, { map });
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
    }
  } else {
    const arrowAnimation = await animationFactory.getArrowAnimation(
      unit,
      { dx, dy },
      coordinatesList,
      null,
      map
    );
    await playAnimation(arrowAnimation, { map });
  }
};
