// TODO: There's a ton of repeated code among the various abilities, try to refactor more of this into the base class

import { render } from '../core/actions';
import GameState from '../core/GameState';
import {
  playArrowAnimation,
  playAttackingAnimation, playWizardAppearingAnimation,
  playWizardVanishingAnimation
} from '../graphics/animations/Animations';
import { manhattanDistance } from '../maps/MapUtils';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import Direction from '../geometry/Direction';
import { pointAt } from '../utils/geometry';
import { checkNotNull } from '../utils/preconditions';
import { HUMAN_DETERMINISTIC } from './controllers/AIUnitControllers';
import Unit from './Unit';
import UnitClass from './UnitClass';
import UnitFactory from './UnitFactory';

/**
 * Helper function for most melee attacks
 */
const attack = async (unit: Unit, target: Unit, damage: number) => {
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

type Props = {
  name: string,
  manaCost: number,
  icon?: string | null
};

abstract class UnitAbility {
  readonly name: string;
  readonly manaCost: number;
  readonly icon: string | null;

  protected constructor({ name, manaCost, icon }: Props) {
    this.name = name;
    this.manaCost = manaCost;
    this.icon = icon || null;
  }

  abstract use(unit: Unit, coordinates: Coordinates | null): Promise<any>;
}

class NormalAttack extends UnitAbility {
  constructor() {
    super({ name: 'ATTACK', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('NormalAttack requires a target!');
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();
    unit.direction = pointAt(unit, coordinates);

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
        const keys = playerUnit.getInventory().get('KEY');
        if (keys.length > 0) {
          playerUnit.getInventory().remove(keys[0]);
          await door.open();
          await playSound(Sounds.OPEN_DOOR);
        } else {
          await playSound(Sounds.FOOTSTEP);
        }
      }

      const spawner = map.getSpawner({ x, y });
      if (spawner && spawner.isBlocking()) {
        await playAttackingAnimation(unit);
        spawner.setState('DEAD');
        await playSound(Sounds.SPECIAL_ATTACK);
      }
    }
  };
}

class HeavyAttack extends UnitAbility {
  constructor() {
    super({ name: 'HEAVY_ATTACK', manaCost: 15, icon: 'strong_icon' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('HeavyAttack requires a target!');
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = pointAt(unit, coordinates);

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const damage = unit.getDamage() * 2;
        await attack(unit, targetUnit, damage);
        await playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
      }
    }
  };
}

class KnockbackAttack extends UnitAbility {
  constructor() {
    super({ name: 'KNOCKBACK_ATTACK', manaCost: 15, icon: 'knockback_icon' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
    }

    const { x, y } = coordinates;
    const { dx, dy } = pointAt(unit, coordinates);

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = { dx, dy };

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
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
        unit.spendMana(this.manaCost);
      }
    }
  };
}

class StunAttack extends UnitAbility {
  constructor() {
    super({ name: 'STUN_ATTACK', manaCost: 15, icon: 'knockback_icon' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('StunAttack requires a target!');
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = pointAt(unit, coordinates);

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (!!targetUnit) {
        const damage = unit.getDamage();
        await attack(unit, targetUnit, damage);
        // stun for 2 turns (if they're already stunned, just leave it)
        targetUnit.stunDuration = Math.max(targetUnit.stunDuration, 2);
        await playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
      }
    }
  };
}

class ShootArrow extends UnitAbility {
  constructor() {
    super({ name: 'SHOOT_ARROW', manaCost: 5 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('ShootArrow requires a target!');
    }
    if (!unit.getEquipment().getBySlot('RANGED_WEAPON')) {
      throw new Error('ShootArrow requires a ranged weapon!');
    }

    const { dx, dy } = pointAt(unit, coordinates);
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

      await playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await targetUnit.takeDamage(damage, unit);
      await playSound(Sounds.PLAYER_HITS_ENEMY);
    } else {
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null);
    }

    unit.spendMana(this.manaCost);
  };
}

class Blink extends UnitAbility {
  constructor() {
    super({ name: 'BLINK', manaCost: 10 });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Blink requires a target!');
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = pointAt(unit, coordinates);

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await moveTo(unit, { x, y });
      unit.spendMana(this.manaCost);
    } else {
      await playSound(Sounds.FOOTSTEP);
    }
  };
}

class Teleport extends UnitAbility {
  readonly RANGE = 5;

  constructor() {
    super({ name: 'TELEPORT', manaCost: 25 });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (manhattanDistance(unit, coordinates) > this.RANGE) {
      throw new Error(`Can't teleport more than ${this.RANGE} units`);
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.direction = pointAt(unit, coordinates);

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      playSound(Sounds.WIZARD_VANISH);
      await playWizardVanishingAnimation(unit);
      await moveTo(unit, { x, y });
      playSound(Sounds.WIZARD_APPEAR);
      await playWizardAppearingAnimation(unit);

      unit.spendMana(this.manaCost);
    } else {
      await playSound(Sounds.FOOTSTEP);
    }
  };
}

class Summon extends UnitAbility {
  constructor() {
    super({ name: 'SUMMON', manaCost: 25 });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Summon requires a target!');
    }

    const state = GameState.getInstance();
    const map = state.getMap();

    const unitClassName = checkNotNull(unit.getUnitClass().summonedUnitClass);
    const unitClass = await UnitClass.load(unitClassName);

    // TODO pick a sound
    playSound(Sounds.WIZARD_APPEAR);
    // TODO animation
    const summonedUnit = await UnitFactory.createUnit({
      name: unitClass.name,
      unitClass,
      faction: unit.faction,
      controller: HUMAN_DETERMINISTIC, // TODO
      level: 1, // whatever
      coordinates
    });
    map.addUnit(summonedUnit);
    unit.spendMana(UnitAbility.SUMMON.manaCost);
  };
}

namespace UnitAbility {
  export const ATTACK: UnitAbility = new NormalAttack();
  export const HEAVY_ATTACK: UnitAbility = new HeavyAttack();
  export const KNOCKBACK_ATTACK: UnitAbility = new KnockbackAttack();
  export const STUN_ATTACK: UnitAbility = new StunAttack();
  export const SHOOT_ARROW: UnitAbility = new ShootArrow();
  export const BLINK: UnitAbility = new Blink();
  export const TELEPORT: Teleport = new Teleport();
  export const SUMMON: UnitAbility = new Summon();
  export type Name = 'ATTACK' | 'HEAVY_ATTACK' | 'KNOCKBACK_ATTACK' | 'STUN_ATTACK' | 'SHOOT_ARROW' | 'BLINK' | 'TELEPORT' | 'SUMMON';
}

export default UnitAbility;
