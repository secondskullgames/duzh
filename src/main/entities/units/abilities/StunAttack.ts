import Unit from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import GameState from '../../../core/GameState';
import { pointAt } from '../../../utils/geometry';
import { playSound } from '../../../sounds/SoundFX';
import Sounds from '../../../sounds/Sounds';
import UnitAbility from './UnitAbility';
import UnitService from '../UnitService';

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
    const unitService = UnitService.getInstance();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unitService.moveUnit(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
        const damage = unit.getDamage();
        await unitService.startAttack(unit, targetUnit);
        const adjustedDamage = await unitService.dealDamage(damage, {
          sourceUnit: unit,
          targetUnit
        });
        const message = this.getDamageLogMessage(unit, targetUnit, adjustedDamage);
        state.logMessage(message);
        targetUnit.setStunned(2);
      }
    }
  };

  getDamageLogMessage = (unit: Unit, target: Unit, damageTaken: number): string => {
    return `${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} is stunned!`;
  }
}