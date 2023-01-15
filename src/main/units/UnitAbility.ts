// TODO: There's a ton of repeated code among the various abilities, try to refactor more of this into the base class

import { render } from '../core/actions';
import GameState from '../core/GameState';
import Coordinates from '../geometry/Coordinates';
import {
  playArrowAnimation,
  playAttackingAnimation,
  playBoltAnimation,
  playWizardAppearingAnimation,
  playWizardVanishingAnimation
} from '../graphics/animations/Animations';
import { manhattanDistance } from '../maps/MapUtils';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import { pointAt } from '../utils/geometry';
import { checkNotNull } from '../utils/preconditions';
import { sleep } from '../utils/promises';
import { HUMAN_DETERMINISTIC } from './controllers/AIUnitControllers';
import Unit from './Unit';
import UnitFactory from './UnitFactory';

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
    this.icon = icon ?? null;
  }

  abstract use(unit: Unit, coordinates: Coordinates | null): Promise<void>;
  abstract logDamage(unit: Unit, target: Unit, damageTaken: number): void;
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
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        const damage = unit.getDamage();
        await unit.startAttack(targetUnit);
        await targetUnit.takeDamage(damage, { sourceUnit: unit, ability: this });
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
          await playSound(Sounds.BLOCKED);
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

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!`);
  }
}

class HeavyAttack extends UnitAbility {
  constructor() {
    super({ name: 'HEAVY_ATTACK', manaCost: 8, icon: 'icon1' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('HeavyAttack requires a target!');
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        await playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
        const damage = unit.getDamage() * 2;
        await unit.startAttack(targetUnit);
        await targetUnit.takeDamage(damage, { sourceUnit: unit, ability: this });
      }
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()} hit ${target.getName()} with a heavy attack for ${damageTaken} damage!`);
  }
}

class KnockbackAttack extends UnitAbility {
  constructor() {
    super({ name: 'KNOCKBACK_ATTACK', manaCost: 8, icon: 'icon6' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
    }

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.setDirection({ dx, dy });

    const targetUnit = map.getUnit(coordinates);
    if (targetUnit) {
      unit.spendMana(this.manaCost);
      const damage = unit.getDamage();
      await unit.startAttack(targetUnit);
      await targetUnit.takeDamage(damage, { sourceUnit: unit, ability: this });
      await playSound(Sounds.SPECIAL_ATTACK);
      targetUnit.setStunned(1);

      const first = Coordinates.plus(targetUnit.getCoordinates(), { dx, dy });
      if (map.contains(first) && !map.isBlocked(first)) {
        targetUnit.setCoordinates(first);
        await render();
        await sleep(50);
        const second = Coordinates.plus(first, { dx, dy });
        if (map.contains(second) && !map.isBlocked(second)) {
          targetUnit.setCoordinates(second);
        }
      }
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} recoils!`);
  }
}

class StunAttack extends UnitAbility {
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
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        await playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
        const damage = unit.getDamage();
        await unit.startAttack(targetUnit);
        await targetUnit.takeDamage(damage, { sourceUnit: unit, ability: this });
        targetUnit.setStunned(2);
      }
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()} hit ${target.getName()} for ${damageTaken} damage!  ${target.getName()} is stunned!`);
  }
}

class ShootArrow extends UnitAbility {
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

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    await render();
    unit.spendMana(this.manaCost);

    const state = GameState.getInstance();
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
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
      await playSound(Sounds.PLAYER_HITS_ENEMY);
      await targetUnit.takeDamage(damage, { sourceUnit: unit, ability: this });
    } else {
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    const state = GameState.getInstance();
    state.logMessage(`${unit.getName()}'s arrow hit ${target.getName()} for ${damageTaken} damage!`);
  }
}

class Bolt extends UnitAbility {
  constructor() {
    super({ name: 'BOLT', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Bolt requires a target!');
    }

    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);
    unit.setDirection({ dx, dy });

    await render();
    unit.spendMana(this.manaCost);

    const state = GameState.getInstance();
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
      const damage = unit.getDamage();

      await targetUnit.takeDamage(damage, { sourceUnit: unit, ability: this });
      await playSound(Sounds.PLAYER_HITS_ENEMY);
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

class Dash extends UnitAbility {
  constructor() {
    super({ name: 'DASH', manaCost: 6, icon: 'icon5' });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Dash requires a target!');
    }

    const { dx, dy } = Coordinates.difference(unit.getCoordinates(), coordinates);

    const state = GameState.getInstance();
    const map = state.getMap();

    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    const distance = 2;
    let { x, y } = unit.getCoordinates();
    let moved = false;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
        await unit.moveTo({ x, y });
        moved = true;
        await render();
        await sleep(50);
      } else {
        break;
      }
    }

    if (moved) {
      unit.spendMana(this.manaCost);
    } else {
      await playSound(Sounds.BLOCKED);
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    throw new Error('can\'t get here');
  }
}

class Teleport extends UnitAbility {
  readonly RANGE = 5;

  constructor() {
    super({ name: 'TELEPORT', manaCost: 24 });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Teleport requires a target!');
    }

    if (manhattanDistance(unit.getCoordinates(), coordinates) > this.RANGE) {
      throw new Error(`Can't teleport more than ${this.RANGE} units`);
    }

    const { x, y } = coordinates;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      playSound(Sounds.WIZARD_VANISH);
      await playWizardVanishingAnimation(unit);
      await unit.moveTo({ x, y });
      playSound(Sounds.WIZARD_APPEAR);
      await playWizardAppearingAnimation(unit);

      unit.spendMana(this.manaCost);
    } else {
      await playSound(Sounds.BLOCKED);
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    throw new Error('can\'t get here');
  }
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

    const unitClass = checkNotNull(unit.getSummonedUnitClass());

    // TODO pick a sound
    playSound(Sounds.WIZARD_APPEAR);
    // TODO animation
    const summonedUnit = await UnitFactory.createUnit({
      unitClass,
      faction: unit.getFaction(),
      controller: HUMAN_DETERMINISTIC, // TODO
      level: 1, // whatever
      coordinates
    });
    map.addUnit(summonedUnit);
    unit.spendMana(UnitAbility.SUMMON.manaCost);
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    throw new Error('can\'t get here');
  }
}

class Strafe extends UnitAbility {
  constructor() {
    super({ name: 'STRAFE', manaCost: 0 });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Strafe requires a target!');
    }
    const map = GameState.getInstance().getMap();
    const { x, y } = coordinates;

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    }
  };

  logDamage(unit: Unit, target: Unit, damageTaken: number) {
    throw new Error('can\'t get here');
  }
}

namespace UnitAbility {
  export const ATTACK: UnitAbility = new NormalAttack();
  export const HEAVY_ATTACK: UnitAbility = new HeavyAttack();
  export const KNOCKBACK_ATTACK: UnitAbility = new KnockbackAttack();
  export const STUN_ATTACK: UnitAbility = new StunAttack();
  export const SHOOT_ARROW: UnitAbility = new ShootArrow();
  export const DASH: UnitAbility = new Dash();
  export const TELEPORT: Teleport = new Teleport();
  export const SUMMON: UnitAbility = new Summon();
  export const BOLT: UnitAbility = new Bolt();
  export const STRAFE = new Strafe();
  export type Name = 'ATTACK' | 'HEAVY_ATTACK' | 'KNOCKBACK_ATTACK' | 'STUN_ATTACK' | 'SHOOT_ARROW' | 'DASH' | 'TELEPORT' | 'SUMMON' | 'BOLT' | 'STRAFE';

  export const forName = (name: Name): UnitAbility => {
    const ability = UnitAbility[name];
    checkNotNull(ability, `Unknown ability ${name}`);
    return ability;
  };
}

export default UnitAbility;
