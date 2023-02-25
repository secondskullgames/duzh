import Unit from '../Unit';
import Coordinates from '../../geometry/Coordinates';
import { GameEngine } from '../../core/GameEngine';
import GameState from '../../core/GameState';
import { pointAt } from '../../utils/geometry';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import { sleep } from '../../utils/promises';
import UnitAbility from './UnitAbility';

export default class KnockbackAttack extends UnitAbility {
  constructor() {
    super({ name: 'KNOCKBACK_ATTACK', manaCost: 8, icon: 'icon6' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
    }

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);

    const map = state.getMap();
    unit.setDirection({ dx, dy });

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(this.manaCost);
      playSound(Sounds.SPECIAL_ATTACK);
      const damage = unit.getDamage();
      await unit.startAttack(targetUnit);
      await engine.dealDamage(damage, {
        sourceUnit: unit,
        targetUnit,
        ability: this
      });
      targetUnit.setStunned(1);

      const first = Coordinates.plus(targetUnit.getCoordinates(), { dx, dy });
      if (map.contains(first) && !map.isBlocked(first)) {
        targetUnit.setCoordinates(first);
        await engine.render();
        await sleep(50);
        const second = Coordinates.plus(first, { dx, dy });
        if (map.contains(second) && !map.isBlocked(second)) {
          targetUnit.setCoordinates(second);
        }
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} recoils!`;
  }
}