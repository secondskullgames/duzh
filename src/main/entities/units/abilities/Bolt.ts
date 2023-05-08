import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility, { UnitAbilityProps } from './UnitAbility';
import { playAnimation } from '../../../graphics/animations/playAnimation';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';

export default class Bolt extends UnitAbility {
  constructor() {
    super({ name: 'BOLT', manaCost: 0 });
  }

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    { state, renderer, animationFactory }: UnitAbilityProps
  ) => {
    if (!coordinates) {
      throw new Error('Bolt requires a target!');
    }

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    await renderer.render();
    unit.spendMana(this.manaCost);

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
      const damage = unit.getDamage();
      const adjustedDamage = await dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = this.getDamageLogMessage(unit, targetUnit, adjustedDamage);
      logMessage(message, { state });
      const boltAnimation = await animationFactory.getBoltAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await playAnimation(boltAnimation, {
        state,
        renderer
      });
    } else {
      const boltAnimation = await animationFactory.getBoltAnimation(unit, { dx, dy }, coordinatesList, null);
      await playAnimation(boltAnimation, {
        state,
        renderer
      });
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()}'s bolt hit ${target.getName()} for ${damageTaken} damage!`;
  }
}