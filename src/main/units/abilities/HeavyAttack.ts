import Unit from '../Unit';
import Coordinates from '../../geometry/Coordinates';
import { GameEngine } from '../../core/GameEngine';
import GameState from '../../core/GameState';
import { pointAt } from '../../utils/geometry';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import UnitAbility from './UnitAbility';

export default class HeavyAttack extends UnitAbility {
  constructor() {
    super({ name: 'HEAVY_ATTACK', manaCost: 8, icon: 'icon1' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('HeavyAttack requires a target!');
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
        const damage = unit.getDamage() * 2;
        await unit.startAttack(targetUnit);
        await engine.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit,
          ability: this
        });
      }
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`);
  }
}