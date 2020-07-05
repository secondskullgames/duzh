import Sprite from '../graphics/sprites/Sprite';
import UnitClass from './UnitClass';
import Sounds from '../sounds/Sounds';
import InventoryMap from '../items/InventoryMap';
import EquipmentMap from '../items/equipment/EquipmentMap';
import Music from '../sounds/Music';
import { Activity, Coordinates, Direction, Entity, EquipmentSlot, GameScreen } from '../types/types';
import { UnitAI } from './UnitAI';
import { resolvedPromise } from '../utils/PromiseUtils';
import { playSound } from '../sounds/SoundFX';
import UnitAbilities, { Ability } from './UnitAbilities';

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
  queuedOrder: (() => Promise<void>) | null;
  aiHandler?: UnitAI;
  activity: Activity;
  direction: Direction | null;
  private readonly remainingCooldowns: Map<Ability, number>;
  readonly abilities: Ability[];

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
    this.queuedOrder = null;
    this.aiHandler = unitClass.aiHandler;
    this.activity = Activity.STANDING;
    this.direction = null;
    this.remainingCooldowns = new Map();
    this.abilities = [UnitAbilities.ATTACK, UnitAbilities.HEAVY_ATTACK, UnitAbilities.KNOCKBACK_ATTACK];

    while (this.level < level) {
      this._levelUp(false);
    }
  }

  private _regenLife() {
    const lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
    this.lifeRemainder += lifePerTurn;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = Math.min(this.life + deltaLife, this.maxLife);
  };

  private _updateCooldowns() {
    // I hate javascript, wtf is this callback signature
    this.remainingCooldowns.forEach((cooldown, ability, map) => {
      map.set(ability, Math.max(cooldown - 1, 0));
    });
  }

  update(): Promise<void> {
    return new Promise(resolve => {
      this._regenLife();
      this._updateCooldowns();
      if (!!this.queuedOrder) {
        const { queuedOrder } = this;
        this.queuedOrder = null;
        return queuedOrder()
          .then(() => resolve());
      }
      return resolve();
    })
      .then(() => {
        if (!!this.aiHandler) {
          return this.aiHandler(this);
        }

        return resolvedPromise();
      })
      .then(() => this.sprite.update());
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

  takeDamage(damage: number, sourceUnit: (Unit | undefined) = undefined): Promise<any> {
    const { playerUnit } = jwb.state;
    const map = jwb.state.getMap();

    return new Promise(resolve => {
      this.life = Math.max(this.life - damage, 0);
      if (this.life === 0) {
        map.removeUnit(this);
        if (this === playerUnit) {
          jwb.state.screen = GameScreen.GAME_OVER;
          Music.stop();
          playSound(Sounds.PLAYER_DIES);
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