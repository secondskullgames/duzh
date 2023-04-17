import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { GameEngine } from '../../../core/GameEngine';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';
import UnitService from '../UnitService';
import GameRenderer from '../../../graphics/renderers/GameRenderer';

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
    const unitService = UnitService.getInstance();

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    await GameRenderer.getInstance().render();
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
      const arrowAnimation = await AnimationFactory.getInstance().getArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await engine.playAnimation(arrowAnimation);
      const adjustedDamage = await unitService.dealDamage(damage, {
        sourceUnit: unit,
        targetUnit
      });
      const message = this.getDamageLogMessage(unit, targetUnit, adjustedDamage);
      state.logMessage(message);
    } else {
      const arrowAnimation = await AnimationFactory.getInstance().getArrowAnimation(unit, { dx, dy }, coordinatesList, null);
      await engine.playAnimation(arrowAnimation);
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`;
  };
}