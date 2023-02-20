import Unit from '../Unit';
import Coordinates from '../../geometry/Coordinates';
import { GameEngine } from '../../core/GameEngine';
import GameState from '../../core/GameState';
import { pointAt } from '../../utils/geometry';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import { playBoltAnimation } from '../../graphics/animations/Animations';
import UnitAbility from './UnitAbility';

export default class Bolt extends UnitAbility {
  constructor() {
    super({ name: 'BOLT', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Bolt requires a target!');
    }

    const engine = GameEngine.getInstance();
    const state = GameState.getInstance();

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    await engine.render();
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
      await engine.dealDamage(damage, {
        sourceUnit: unit,
        targetUnit,
        ability: this
      });
      await playBoltAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
    } else {
      await playBoltAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()}'s bolt hit ${target.getName()} for ${damageTaken} damage!`);
  }
}