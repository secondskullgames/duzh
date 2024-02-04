import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { dealDamage } from '../../../actions/dealDamage';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { sleep } from '../../../utils/promises';
import { die } from '../../../actions/die';
import { Session } from '../../../core/Session';

const manaCost = 5;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`;
};

export const ShootArrow: UnitAbility = {
  name: AbilityName.SHOOT_ARROW,
  icon: null,
  manaCost,

  use: async (unit: Unit, coordinates: Coordinates | null, session: Session) => {
    if (!coordinates) {
      throw new Error('ShootArrow requires a target!');
    }
    if (!unit.getEquipment().getBySlot('RANGED_WEAPON')) {
      throw new Error('ShootArrow requires a ranged weapon!');
    }

    const map = session.getMap();
    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    unit.spendMana(manaCost);

    const coordinatesList = [];
    let { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      const damage = unit.getRangedDamage();
      playSound(Sounds.PLAYER_HITS_ENEMY);
      const arrowAnimation = await AnimationFactory.getArrowAnimation(
        unit,
        { dx, dy },
        coordinatesList,
        targetUnit,
        { map, imageFactory: session.getImageFactory() }
      );
      await playAnimation(arrowAnimation, { map });
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
      session.getTicker().log(message, { turn: session.getTurn() });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, { map, session });
      }
    } else {
      const arrowAnimation = await AnimationFactory.getArrowAnimation(
        unit,
        { dx, dy },
        coordinatesList,
        null,
        { map, imageFactory: session.getImageFactory() }
      );
      await playAnimation(arrowAnimation, { map });
    }
  }
};
