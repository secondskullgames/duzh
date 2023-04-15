import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { GameEngine } from '../../../core/GameEngine';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import UnitService from '../UnitService';

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
    const unitService = UnitService.getInstance();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains(coordinates) && !map.isBlocked(coordinates)) {
      await unitService.moveUnit(unit, coordinates);
    } else {
      const targetUnit = map.getUnit(coordinates);
      if (targetUnit) {
        playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
        const damage = unit.getDamage() * 2;
        await unitService.startAttack(unit, targetUnit);
        const adjustedDamage = await unitService.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit
        });
        const message = this.getDamageLogMessage(unit, targetUnit, adjustedDamage);
        state.logMessage(message);
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number) => {
    return `${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`;
  }
}