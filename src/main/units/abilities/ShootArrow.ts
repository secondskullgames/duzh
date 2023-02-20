import Unit from '../Unit';
import Coordinates from '../../geometry/Coordinates';
import { GameEngine } from '../../core/GameEngine';
import GameState from '../../core/GameState';
import { pointAt } from '../../utils/geometry';
import { playSound } from '../../sounds/SoundFX';
import Sounds from '../../sounds/Sounds';
import { playArrowAnimation } from '../../graphics/animations/Animations';
import UnitAbility from './UnitAbility';

export default class ShootArrow extends UnitAbility {
  constructor() {
    super({ name: 'SHOOT_ARROW', manaCost: 6 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('ShootArrow requires a target!');
    }
    if (!unit.getEquipment().getBySlot('RANGED_WEAPON')) {
      throw new Error('ShootArrow requires a ranged weapon!');
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
      const damage = unit.getRangedDamage();
      playSound(Sounds.PLAYER_HITS_ENEMY);
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await engine.dealDamage(damage, {
        sourceUnit: unit,
        targetUnit,
        ability: this
      });
    } else {
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`);
  }
}