import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import { logMessage } from '../../../actions/logMessage';
import { dealDamage } from '../../../actions/dealDamage';
import { startAttack } from '../../../actions/startAttack';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import { walk } from '../../../actions/walk';

export default class StunAttack extends UnitAbility {
  constructor() {
    super({ name: 'STUN_ATTACK', manaCost: 10, icon: 'icon2' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('StunAttack requires a target!');
    }

    const { x, y } = coordinates;

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
        const targetUnit = map.getUnit({ x, y });
        if (targetUnit) {
          playSound(Sounds.SPECIAL_ATTACK);
          unit.spendMana(this.manaCost);
          const damage = unit.getDamage();
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
          targetUnit.setStunned(2);
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} is stunned!`;
  }
}