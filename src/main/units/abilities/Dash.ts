import Unit from '../Unit';
import Coordinates from '../../geometry/Coordinates';
import { GameEngine } from '../../core/GameEngine';
import GameState from '../../core/GameState';
import { pointAt } from '../../utils/geometry';
import { sleep } from '../../utils/promises';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import UnitAbility from './UnitAbility';

export default class Dash extends UnitAbility {
  constructor() {
    super({ name: 'DASH', manaCost: 6, icon: 'icon5' });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Dash requires a target!');
    }

    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();
    const map = state.getMap();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
        await unit.moveTo({ x, y });
        moved = true;
        await engine.render();
        await sleep(50);
      } else {
        break;
      }
    }

    if (moved) {
      unit.spendMana(this.manaCost);
    } else {
      playSound(Sounds.BLOCKED);
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    throw new Error('can\'t get here');
  }
}