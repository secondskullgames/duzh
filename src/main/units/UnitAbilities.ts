import Unit from './Unit';
import Sounds from '../sounds/Sounds';
import { Direction } from '../types/types';
import { playSound } from '../sounds/SoundFX';
import { attack, heavyAttack } from './UnitUtils';

abstract class Ability {
  readonly name: string;
  readonly cooldown: number;

  protected constructor(name: string, cooldown: number) {
    this.name = name;
    this.cooldown = cooldown;
  }

  abstract use(unit: Unit, direction: Direction | null): Promise<any>
}

class NormalAttack extends Ability {
  constructor() {
    super('ATTACK', 0);
  }

  use(unit: Unit, direction: Direction | null): Promise<any> {
    if (!direction) {
      throw 'NormalAttack requires a direction!';
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const { playerUnit } = jwb.state;
    const map = jwb.state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    return new Promise(resolve => {
      if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
        [unit.x, unit.y] = [x, y];
        if (unit === playerUnit) {
          playSound(Sounds.FOOTSTEP);
        }
        resolve();
      } else {
        const targetUnit = map.getUnit({ x, y });
        if (!!targetUnit) {
          attack(unit, targetUnit)
            .then(resolve);
        } else {
          resolve();
        }
      }
    });
  }
}

class HeavyAttack extends Ability {
  constructor() {
    super('HEAVY_ATTACK', 10);
  }

  use(unit: Unit, direction: Direction | null): Promise<any> {
    if (!direction) {
      throw 'HeavyAttack requires a direction!';
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const { playerUnit } = jwb.state;
    const map = jwb.state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    return new Promise(resolve => {
      if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
        [unit.x, unit.y] = [x, y];
        if (unit === playerUnit) {
          playSound(Sounds.FOOTSTEP);
        }
        resolve();
      } else {
        const targetUnit = map.getUnit({ x, y });
        if (!!targetUnit) {
          heavyAttack(unit, targetUnit)
            .then(resolve);
        } else {
          resolve();
        }
      }
    });
  }

}

const UnitAbilities = {
  ATTACK: new NormalAttack(),
  HEAVY_ATTACK: new HeavyAttack()
};

export default UnitAbilities;
export {
  Ability
};