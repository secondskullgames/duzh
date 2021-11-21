// TODO: There's a ton of repeated code among the various abilities, try to refactor more of this into the base class

import { render } from '../core/actions';
import GameState from '../core/GameState';
import { playArrowAnimation, playAttackingAnimation } from '../graphics/animations/Animations';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../types/Coordinates';
import Direction from '../types/Direction';
import { EquipmentSlot } from '../types/types';
import Unit from './Unit';

/**
 * Helper function for most melee attacks
 */
const attack = async (unit: Unit, target: Unit, damage: number) => {
  const state = GameState.getInstance();
  state.messages.push(`${unit.name} hit ${target.name} for ${damage} damage!`);

  await playAttackingAnimation(unit, target);
  await target.takeDamage(damage, unit);
};

const moveTo = async (unit: Unit, { x, y }: Coordinates) => {
  const { playerUnit } = GameState.getInstance();
  [unit.x, unit.y] = [x, y];
  if (unit === playerUnit) {
    await playSound(Sounds.FOOTSTEP);
  }
};

abstract class UnitAbility {
  readonly name: string;
  readonly cooldown: number;
  readonly icon: string | null;

  protected constructor(name: string, cooldown: number, icon: string | null = null) {
    this.name = name;
    this.cooldown = cooldown;
    this.icon = icon;
  }

  abstract use(unit: Unit, direction: Direction | null): Promise<any>;
}

class NormalAttack extends UnitAbility {
  constructor() {
    super('ATTACK', 0);
  }

  use = async (unit: Unit, direction: Direction | null) => {
    if (!direction) {
      throw 'NormalAttack requires a direction!';
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const damage = unit.getDamage();
        await attack(unit, targetUnit, damage);
        await playSound(Sounds.PLAYER_HITS_ENEMY);
      }
    }
  };
}

class HeavyAttack extends UnitAbility {
  constructor() {
    super('HEAVY_ATTACK', 15, 'strong_icon');
  }

  use = async (unit: Unit, direction: Direction | null) => {
    if (!direction) {
      throw 'HeavyAttack requires a direction!';
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        unit.useAbility(this);
        const damage = unit.getDamage() * 2;
        await attack(unit, targetUnit, damage);
        await playSound(Sounds.SPECIAL_ATTACK);
      }
    }
  };
}

class KnockbackAttack extends UnitAbility {
  constructor() {
    super('KNOCKBACK_ATTACK', 15, 'knockback_icon');
  }

  use = async (unit: Unit, direction: Direction | null) => {
    if (!direction) {
      throw 'KnockbackAttack requires a direction!';
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        unit.useAbility(this);
        const damage = unit.getDamage();
        await attack(unit, targetUnit, damage);
        let targetCoordinates = { x, y };

        // knockback by one tile
        const oneTileBack = { x: targetCoordinates.x + dx, y: targetCoordinates.y + dy };
        if (map.contains(oneTileBack) && !map.isBlocked(oneTileBack)) {
          targetCoordinates = oneTileBack;
        }
        [targetUnit.x, targetUnit.y] = [targetCoordinates.x, targetCoordinates.y];

        // stun for 1 turn (if they're already stunned, just leave it)
        targetUnit.stunDuration = Math.max(targetUnit.stunDuration, 1);
        await playSound(Sounds.SPECIAL_ATTACK);
      }
    }
  };
}

class StunAttack extends UnitAbility {
  constructor() {
    super('STUN_ATTACK', 15, 'knockback_icon');
  }

  use = async (unit: Unit, direction: Direction | null) => {
    if (!direction) {
      throw 'StunAttack requires a direction!';
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        unit.useAbility(this);
        const damage = unit.getDamage();
        await attack(unit, targetUnit, damage);
        // stun for 2 turns (if they're already stunned, just leave it)
        targetUnit.stunDuration = Math.max(targetUnit.stunDuration, 2);
        await playSound(Sounds.SPECIAL_ATTACK);
      }
    }
  };
}

class ShootArrow extends UnitAbility {
  constructor() {
    super('SHOOT_ARROW', 0);
  }

  use = async (unit: Unit, direction: Direction | null) => {
    if (!direction) {
      throw 'ShootArrow requires a direction!';
    }

    const { dx, dy } = direction;
    unit.direction = { dx, dy };

    await render();
    if (!unit.equipment.get(EquipmentSlot.RANGED_WEAPON)) {
      // change direction and re-render, but don't do anything (don't spend a turn)
      return;
    }

    const state = GameState.getInstance();
    const map = state.getMap();
    const coordinatesList = [];
    let { x, y } = { x: unit.x + dx, y: unit.y + dy };
    while (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      coordinatesList.push({ x, y });
      x += dx;
      y += dy;
    }

    const targetUnit = map.getUnit({ x, y });
    if (!!targetUnit) {
      const { messages } = GameState.getInstance();
      const damage = unit.getRangedDamage();
      messages.push(`${unit.name} hit ${targetUnit.name} for ${damage} damage!`);

      await playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await targetUnit.takeDamage(damage, unit);
      await playSound(Sounds.PLAYER_HITS_ENEMY);
    } else {
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };
}

namespace UnitAbility {
  export const ATTACK = new NormalAttack();
  export const HEAVY_ATTACK = new HeavyAttack();
  export const KNOCKBACK_ATTACK = new KnockbackAttack();
  export const STUN_ATTACK = new StunAttack();
  export const SHOOT_ARROW = new ShootArrow();
}

export default UnitAbility;
