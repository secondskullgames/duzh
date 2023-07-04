import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility } from './UnitAbility';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { dealDamage } from '../../../actions/dealDamage';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { AbilityName } from './AbilityName';
import { sleep } from '../../../utils/promises';
import { die } from '../../../actions/die';
import { GlobalContext } from '../../../core/GlobalContext';

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s bolt hit ${target.getName()} for ${damageTaken} damage!`;
};

export const ShootBolt: UnitAbility = {
  name: AbilityName.BOLT,
  icon: null,
  manaCost: 0,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    context: GlobalContext
  ) => {
    const { state } = context;
    if (!coordinates) {
      throw new Error('Bolt requires a target!');
    }

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    // unit.spendMana(0); // TODO

    const map = state.getMap();
    const coordinatesList = [];
    let { x, y } = Coordinates.plus(unit.getCoordinates(), { dx, dy });
    while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (targetUnit) {
      playSound(Sounds.PLAYER_HITS_ENEMY);
      const damage = unit.getMeleeDamage();
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
      const boltAnimation = await AnimationFactory.getBoltAnimation(
        unit,
        { dx, dy },
        coordinatesList,
        targetUnit,
        context
      );
      await playAnimation(boltAnimation, context);
      context.ticker.log(message, context);
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, context);
      }
    } else {
      const boltAnimation = await AnimationFactory.getBoltAnimation(
        unit,
        { dx, dy },
        coordinatesList,
        null,
        context
      );
      await playAnimation(boltAnimation, context);
    }
  }
}