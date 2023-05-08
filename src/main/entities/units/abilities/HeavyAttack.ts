import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import { moveUnit } from '../../../actions/moveUnit';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import { startAttack } from '../../../actions/startAttack';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { walk } from '../../../actions/walk';

export default class HeavyAttack extends UnitAbility {
  constructor() {
    super({ name: 'HEAVY_ATTACK', manaCost: 8, icon: 'icon1' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('HeavyAttack requires a target!');
    }

    const state = GameState.getInstance();
    const map = state.getMap();

    const direction = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection(direction);

    if (!map.contains(coordinates)) {
      // do nothing
      return;
    } else {
      if (!map.isBlocked(coordinates)) {
        await walk(unit, direction, { state });
      } else {
        const targetUnit = map.getUnit(coordinates);
        if (targetUnit) {
          playSound(Sounds.SPECIAL_ATTACK);
          unit.spendMana(this.manaCost);
          const damage = unit.getDamage() * 2;
          await startAttack(unit, targetUnit, {
            state,
            renderer: GameRenderer.getInstance(),
            animationFactory: AnimationFactory.getInstance()
          });
          const adjustedDamage = await dealDamage(damage, {
            sourceUnit: unit,
            targetUnit
          });
          const message = this.getDamageLogMessage(unit, targetUnit, adjustedDamage);
          logMessage(message, { state });
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
    return `${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`;
  }
}