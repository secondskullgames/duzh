import Sprite from '../graphics/sprites/Sprite';
import UnitClass from './UnitClass';
import Sounds from '../sounds/Sounds';
import InventoryMap from '../items/InventoryMap';
import EquipmentMap from '../items/equipment/EquipmentMap';
import Music from '../sounds/Music';
import UnitController from './controllers/UnitController';
import UnitAbilities, { Ability } from './UnitAbilities';
import { Activity, Coordinates, Direction, Entity, EquipmentSlot, GameScreen } from '../types/types';
import { playSound } from '../sounds/SoundFX';
import { resolvedPromise } from '../utils/PromiseUtils';

const LIFE_PER_TURN_MULTIPLIER = 0.005;

class Unit implements Entity {
  readonly unitClass: UnitClass;
  readonly char = '@';
  readonly sprite: Sprite;
  inventory: InventoryMap;
  equipment: EquipmentMap;
  x: number;
  y: number;
  name: string;
  level: number;
  experience: number;
  life: number;
  maxLife: number;
  mana: number | null;
  maxMana: number | null;
  lifeRemainder: number;
  private _damage: number;
  controller: UnitController;
  activity: Activity;
  direction: Direction | null;
  private readonly remainingCooldowns: Map<Ability, number>;
  readonly abilities: Ability[];
  stunDuration: number;

  constructor(unitClass: UnitClass, name: string, level: number, { x, y }: Coordinates) {
    this.unitClass = unitClass;
    this.sprite = unitClass.sprite(this, unitClass.paletteSwaps);
    this.inventory = new InventoryMap();
    this.equipment = new EquipmentMap();

    this.x = x;
    this.y = y;
    this.name = name;
    this.level = 1;
    this.experience = 0;
    this.life = unitClass.startingLife;
    this.maxLife = unitClass.startingLife;
    this.mana = unitClass.startingMana;
    this.maxMana = unitClass.startingMana;
    this.lifeRemainder = 0;
    this._damage = unitClass.startingDamage;
    this.controller = unitClass.controller;
    this.activity = Activity.STANDING;
    this.direction = null;
    this.remainingCooldowns = new Map();
    // TODO: this needs to be specific to the player unit
    this.abilities = [UnitAbilities.ATTACK, UnitAbilities.HEAVY_ATTACK, UnitAbilities.KNOCKBACK_ATTACK, UnitAbilities.STUN_ATTACK];
    this.stunDuration = 0;

    while (this.level < level) {
      this._levelUp(false);
    }
  }

  private _upkeep() {
    // life regeneration
    const lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
    this.lifeRemainder += lifePerTurn;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = Math.min(this.life + deltaLife, this.maxLife);

    // I hate javascript, wtf is this callback signature
    this.remainingCooldowns.forEach((cooldown, ability, map) => {
      map.set(ability, Math.max(cooldown - 1, 0));
    });
  }

  private _endOfTurn() {
    // decrement stun duration
    this.stunDuration = Math.max(this.stunDuration - 1, 0)
  }

  update(): Promise<void> {
    return new Promise<void>(resolve => {
      this._upkeep();
      return resolve();
    })
      .then(() => {
        if (this.stunDuration === 0) {
          return this.controller.issueOrder(this);
        }
        return resolvedPromise();
      })
      .then(() => this.sprite.update())
      .then(() => this._endOfTurn());
  }

  getDamage(): number {
    let damage = this._damage;
    this.equipment.getEntries()
      .filter(([slot, item]) => (slot !== EquipmentSlot.RANGED_WEAPON))
      .forEach(([slot, item]) => {
        damage += (item.damage || 0);
      });
    return damage;
  }

  getRangedDamage(): number {
    let damage = this._damage;

    this.equipment.getEntries()
      .filter(([slot, item]) => (slot !== EquipmentSlot.MELEE_WEAPON))
      .forEach(([slot, item]) => {
        if (slot === EquipmentSlot.RANGED_WEAPON) {
          damage += (item.damage || 0);
        } else {
          damage += (item.damage || 0) / 2;
        }
      });
    return Math.round(damage);
  }

  private _levelUp(withSound: boolean) {
    this.level++;
    const lifePerLevel = this.unitClass.lifePerLevel(this.level);
    this.maxLife += lifePerLevel;
    this.life += lifePerLevel;
    this._damage += this.unitClass.damagePerLevel(this.level);
    if (withSound) {
      playSound(Sounds.LEVEL_UP);
    }
  }

  gainExperience(experience: number) {
    this.experience += experience;
    const experienceToNextLevel = this.experienceToNextLevel();
    while (!!experienceToNextLevel && this.experience >= experienceToNextLevel) {
      this.experience -= experienceToNextLevel;
      this._levelUp(true);
    }
  }

  experienceToNextLevel(): (number | null) {
    const { unitClass } = this;
    if (unitClass.experienceToNextLevel && (this.level < unitClass.maxLevel)) {
      return unitClass.experienceToNextLevel(this.level);
    }
    return null;
  }

  takeDamage(damage: number, sourceUnit: (Unit | undefined) = undefined): Promise<void> {
    const { playerUnit } = jwb.state;
    const map = jwb.state.getMap();

    return new Promise(resolve => {
      this.life = Math.max(this.life - damage, 0);
      if (this.life === 0) {
        map.removeUnit(this);
        if (this === playerUnit) {
          jwb.state.screen = GameScreen.GAME_OVER;
          Music.stop();
          Music.playFigure(Music.GAME_OVER)
        } else {
          playSound(Sounds.ENEMY_DIES);
        }

        if (sourceUnit) {
          sourceUnit.gainExperience(1);
        }
      } else {
        if (this === playerUnit) {
          playSound(Sounds.PLAYER_HITS_ENEMY);
        } else {
          playSound(Sounds.ENEMY_HITS_PLAYER);
        }
      }
      resolve();
    });
  };

  getCooldown(ability: Ability): number {
    return this.remainingCooldowns.get(ability) || 0
  }

  useAbility(ability: Ability) {
    this.remainingCooldowns.set(ability, ability.cooldown);
  }
}

export default Unit;