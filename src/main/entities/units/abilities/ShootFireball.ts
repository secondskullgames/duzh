import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/playSound';
import Sounds from '../../../sounds/Sounds';
import { type UnitAbility, type UnitAbilityContext } from './UnitAbility';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { AbilityName } from './AbilityName';
import { sleep } from '../../../utils/promises';
import { die } from '../../../actions/die';

const MANA_COST = 25;
const DAMAGE = 20;

const getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
  return `${unit.getName()}'s fireball hit ${target.getName()} for ${damageTaken} damage!`;
};

export const ShootFireball: UnitAbility = {
  name: AbilityName.SHOOT_FIREBALL,
  icon: 'icon6',
  manaCost: MANA_COST,

  use: async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, imageFactory }: UnitAbilityContext
  ) => {
    if (!coordinates) {
      throw new Error('ShootFireball requires a target!');
    }

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    await renderer.render();
    unit.spendMana(MANA_COST);

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
      const fireballAnimation = await AnimationFactory.getFireballAnimation(
        unit,
        { dx, dy },
        coordinatesList,
        targetUnit,
        { state, imageFactory }
      );
      await playAnimation(fireballAnimation, {
        state,
        renderer
      });
      const adjustedDamage = await dealDamage(DAMAGE, {
        sourceUnit: unit,
        targetUnit
      });
      const message = getDamageLogMessage(unit, targetUnit, adjustedDamage);
      logMessage(message, { state });
      if (targetUnit.getLife() <= 0) {
        await sleep(100);
        await die(targetUnit, { state, imageFactory });
      }
    } else {
      const fireballAnimation = await AnimationFactory.getFireballAnimation(
        unit,
        { dx, dy },
        coordinatesList,
        null,
        { state, imageFactory }
      );
      await playAnimation(fireballAnimation, {
        state,
        renderer
      });
    }
  }
}