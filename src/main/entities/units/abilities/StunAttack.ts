import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { GameEngine } from '../../../core/GameEngine';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';

export default class StunAttack extends UnitAbility {
  constructor() {
    super({ name: 'STUN_ATTACK', manaCost: 10, icon: 'icon2' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('StunAttack requires a target!');
    }

    const { x, y } = coordinates;

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
        const damage = unit.getDamage();
        await unit.startAttack(targetUnit);
        await engine.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit,
          ability: this
        });
        targetUnit.setStunned(2);
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} is stunned!`;
  }
}