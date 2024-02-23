import { type UnitAbility } from './UnitAbility';
import { AbilityName } from './AbilityName';
import Unit, { DefendResult } from '../Unit';
import Coordinates from '../../../geometry/Coordinates';
import { pointAt } from '../../../utils/geometry';
import { sleep } from '../../../utils/promises';
import Sounds from '../../../sounds/Sounds';
import { moveUnit } from '../../../actions/moveUnit';
import { Session } from '../../../core/Session';
import { GameState } from '../../../core/GameState';
import { Attack, AttackResult, attackUnit } from '../../../actions/attackUnit';

const damageCoefficient = 1;
const attack: Attack = {
  sound: Sounds.SPECIAL_ATTACK,
  calculateAttackResult: (unit: Unit): AttackResult => {
    const damage = Math.round(unit.getMeleeDamage() * damageCoefficient);
    return { damage };
  },
  getDamageLogMessage: (attacker: Unit, defender: Unit, result: DefendResult): string => {
    const attackerName = attacker.getName();
    const defenderName = defender.getName();
    const damage = result.damageTaken;
    return `${attackerName} hit ${defenderName} for ${damage} damage!`;
  }
};

export class DashAttack implements UnitAbility {
  readonly name = AbilityName.DASH_ATTACK;
  readonly manaCost = 8;
  readonly icon = 'icon5'; // TODO

  use = async (
    unit: Unit,
    coordinates: Coordinates | null,
    session: Session,
    state: GameState
  ) => {
    if (!coordinates) {
      throw new Error('DashAttack requires a target!');
    }

    const map = session.getMap();
    let { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);
    dx = Math.sign(dx);
    dy = Math.sign(dy);

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const { x, y } = unit.getCoordinates();
    const targetCoordinates = { x: x + dx, y: y + dy };
    if (map.contains(targetCoordinates)) {
      const targetUnit = map.getUnit(targetCoordinates);
      if (targetUnit) {
        // begin DO_ATTACK
        unit.spendMana(this.manaCost);

        const behindCoordinates = { x: x + 2 * dx, y: y + 2 * dy };
        if (map.contains(behindCoordinates) && !map.isBlocked(behindCoordinates)) {
          await moveUnit(targetUnit, behindCoordinates, session, state);
          await moveUnit(unit, targetCoordinates, session, state);
        }
        await attackUnit(unit, targetUnit, attack, session, state);
        // End DO_ATTACK
        await sleep(100);
        return;
      }
    }

    state.getSoundPlayer().playSound(Sounds.BLOCKED);
  };
}
