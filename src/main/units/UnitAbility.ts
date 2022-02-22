// TODO: There's a ton of repeated code among the various abilities, try to refactor more of this into the base class

import { render } from '../core/actions';
import GameState from '../core/GameState';
import { playArrowAnimation, playAttackingAnimation } from '../graphics/animations/Animations';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import Unit from './Unit';

/**
 * Helper function for most melee attacks
 */
const attack = async (unit: Unit, target: Unit, damage: number) => {
  GameState.getInstance().pushMessage(`${unit.name} hit ${target.name} for ${damage} damage!`);

  await playAttackingAnimation(unit, target);
  await target.takeDamage(damage, unit);
};

const moveTo = async (unit: Unit, { x, y }: Coordinates) => {
  const playerUnit = GameState.getInstance().getPlayerUnit();
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
      throw new Error('NormalAttack requires a direction!');
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        const damage = unit.getDamage();
        await attack(unit, targetUnit, damage);
        await playSound(Sounds.PLAYER_HITS_ENEMY);
      }

      const door = map.getDoor({ x, y });
      if (door) {
        const keys = playerUnit.getInventory().get('KEY') || [];
        if (keys.length > 0) {
          playerUnit.getInventory().remove(keys[0]);
          await door.open();
          await playSound(Sounds.OPEN_DOOR);
        } else {
          await playSound(Sounds.FOOTSTEP);
        }
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
      throw new Error('HeavyAttack requires a direction!');
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        unit.triggerCooldown(this);
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
      throw new Error('KnockbackAttack requires a direction!');
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        unit.triggerCooldown(this);
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
      throw new Error('StunAttack requires a direction!');
    }

    const { dx, dy } = direction;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = { dx: x - unit.x, dy: y - unit.y };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        unit.triggerCooldown(this);
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
      throw new Error('ShootArrow requires a direction!');
    }
    if (!unit.getEquipment().getBySlot('RANGED_WEAPON')) {
      throw new Error('ShootArrow requires a ranged weapon!');
    }

    const { dx, dy } = direction;
    unit.direction = { dx, dy };

    await render();

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
      const damage = unit.getRangedDamage();
      state.pushMessage(`${unit.name} hit ${targetUnit.name} for ${damage} damage!`);

      await playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await targetUnit.takeDamage(damage, unit);
      await playSound(Sounds.PLAYER_HITS_ENEMY);
    } else {
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };
}

class Blink extends UnitAbility {
  constructor() {
    super('BLINK', 10);
  }

  /**
   * @override
   */
  use = async (unit: Unit, direction: Direction | null) => {
    if (!direction) {
      throw new Error('Blink requires a direction!');
    }

    const dx = 2 * direction.dx;
    const dy = 2 * direction.dy;
    const { x, y } = { x: unit.x + dx, y: unit.y + dy };

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = direction;

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
      unit.triggerCooldown(this);
    } else {
      await playSound(Sounds.FOOTSTEP);
    }
  };
}

namespace UnitAbility {
  export const ATTACK: UnitAbility = new NormalAttack();
  export const HEAVY_ATTACK: UnitAbility = new HeavyAttack();
  export const KNOCKBACK_ATTACK: UnitAbility = new KnockbackAttack();
  export const STUN_ATTACK: UnitAbility = new StunAttack();
  export const SHOOT_ARROW: UnitAbility = new ShootArrow();
  export const BLINK: UnitAbility = new Blink();
  export type Name = 'ATTACK' | 'HEAVY_ATTACK' | 'KNOCKBACK_ATTACK' | 'STUN_ATTACK' | 'SHOOT_ARROW' | 'BLINK';
}

export default UnitAbility;
