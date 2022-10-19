// TODO: There's a ton of repeated code among the various abilities, try to refactor more of this into the base class

import { attack, render } from '../core/actions';
import GameState from '../core/GameState';
import {
  playArrowAnimation,
  playAttackingAnimation, playBoltAnimation,
  playWizardAppearingAnimation,
  playWizardVanishingAnimation
} from '../graphics/animations/Animations';
import { manhattanDistance } from '../maps/MapUtils';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Coordinates from '../geometry/Coordinates';
import { pointAt } from '../utils/geometry';
import { checkNotNull } from '../utils/preconditions';
import { HUMAN_DETERMINISTIC } from './controllers/AIUnitControllers';
import Unit from './Unit';
import UnitClass from './UnitClass';
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
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        await attack(unit, targetUnit);
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
      if (!!targetUnit) {
        await playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
        const damage = unit.getDamage() * 2;
        await attack(unit, targetUnit, damage);
      }
    }
  };
}

class KnockbackAttack extends UnitAbility {
  constructor() {
    super({ name: 'KNOCKBACK_ATTACK', manaCost: 8, icon: 'icon6' });
  }

  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('KnockbackAttack requires a target!');
    }

    const { x, y } = coordinates;
    const { dx, dy } = pointAt(unit.getCoordinates(), coordinates);

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.setDirection({ dx, dy });

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
    } else {
      const targetUnit = map.getUnit({ x, y });
      if (targetUnit) {
        await attack(unit, targetUnit);
        let targetCoordinates = { x, y };

        // knockback by one tile
        const oneTileBack = { x: targetCoordinates.x + dx, y: targetCoordinates.y + dy };
        if (map.contains(oneTileBack) && !map.isBlocked(oneTileBack)) {
          targetCoordinates = oneTileBack;
        }
        targetUnit.setCoordinates(targetCoordinates);

        targetUnit.getStunned(1);
        await playSound(Sounds.SPECIAL_ATTACK);
        unit.spendMana(this.manaCost);
      }
    }
  };
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
        await attack(unit, targetUnit);
        targetUnit.getStunned(2);
      }
    }
  };
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
      await targetUnit.takeDamage(damage, unit);
    } else {
      await playArrowAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };
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

      await targetUnit.takeDamage(damage, unit);
      await playSound(Sounds.PLAYER_HITS_ENEMY);
      await playBoltAnimation(unit, { dx, dy }, coordinatesList, targetUnit);
    } else {
      await playBoltAnimation(unit, { dx, dy }, coordinatesList, null);
    }
  };
}

class Blink extends UnitAbility {
  constructor() {
    super({ name: 'BLINK', manaCost: 6, icon: 'icon5' });
  }

  /**
   * @override
   */
  use = async (unit: Unit, coordinates: Coordinates | null) => {
    if (!coordinates) {
      throw new Error('Blink requires a target!');
    }

    const { x: unitX, y: unitY } = unit.getCoordinates();
    const { dx, dy } = Coordinates.difference(coordinates, unit.getCoordinates());
    const x = unitX + 2 * dx;
    const y = unitY + 2 * dy;

    const state = GameState.getInstance();
    const map = state.getMap();
    unit.setDirection(pointAt(unit.getCoordinates(), coordinates));

    if (map.contains({ x, y }) && !map.isBlocked({ x, y })) {
      await unit.moveTo({ x, y });
      unit.spendMana(this.manaCost);
    } else {
      await playSound(Sounds.FOOTSTEP);
    }
  };
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
      faction: unit.getFaction(),
      controller: HUMAN_DETERMINISTIC, // TODO
      level: 1, // whatever
      coordinates
    });
    map.addUnit(summonedUnit);
    unit.spendMana(UnitAbility.SUMMON.manaCost);
  };
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
  export const BOLT: UnitAbility = new Bolt();
  export const STRAFE = new Strafe();
  export type Name = 'ATTACK' | 'HEAVY_ATTACK' | 'KNOCKBACK_ATTACK' | 'STUN_ATTACK' | 'SHOOT_ARROW' | 'BLINK' | 'TELEPORT' | 'SUMMON' | 'BOLT' | 'STRAFE';
}

export default UnitAbility;
