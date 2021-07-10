import Sprite from '../graphics/sprites/Sprite';
import UnitClass from './UnitClass';
import Sounds from '../sounds/Sounds';
import InventoryMap from '../items/InventoryMap';
import EquipmentMap from '../items/equipment/EquipmentMap';
import Music from '../sounds/Music';
import UnitController from './controllers/UnitController';
import UnitAbility from './UnitAbility';
import Direction from '../types/Direction';
import EquipmentClass from '../items/equipment/EquipmentClass';
import Equipment from '../items/equipment/Equipment';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import { Activity, Coordinates, Entity, EquipmentSlot, GameScreen } from '../types/types';
import { playSound } from '../sounds/SoundFX';

// Regenerate 1% of life every 20 turns
const LIFE_PER_TURN_MULTIPLIER = 0.0005;

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
  direction: Direction;
  private readonly remainingCooldowns: Map<UnitAbility, number>;
  readonly abilities: UnitAbility[];
  stunDuration: number;

  constructor(unitClass: UnitClass, name: string, controller: UnitController, level: number, { x, y }: Coordinates) {
    this.unitClass = unitClass;
    this.sprite = SpriteFactory.createUnitSprite(unitClass.sprite, this, unitClass.paletteSwaps);
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
    this.controller = controller;
    this.activity = Activity.STANDING;
    this.direction = Direction.S;
    this.remainingCooldowns = new Map();
    // TODO: this needs to be specific to the player unit
    this.abilities = [UnitAbility.ATTACK, UnitAbility.HEAVY_ATTACK, UnitAbility.KNOCKBACK_ATTACK, UnitAbility.STUN_ATTACK];
    this.stunDuration = 0;

    unitClass.equipment?.forEach(equipmentName => {
      const equipment = new Equipment(EquipmentClass.forName(equipmentName), null); // TODO deal with InventoryItem
      this.equipment.add(equipment);
      equipment.attach(this);
    })

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
        return Promise.resolve();
      })
      .then(() => this.sprite.getImage())
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
    const lifePerLevel = this.unitClass.lifePerLevel;
    this.maxLife += lifePerLevel;
    this.life += lifePerLevel;
    this._damage += this.unitClass.damagePerLevel;
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
      return unitClass.experienceToNextLevel[this.level];
    }
    return null;
  }

  takeDamage(damage: number, sourceUnit?: Unit): Promise<void> {
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
      }
      resolve();
    });
  };

  getCooldown(ability: UnitAbility): number {
    return this.remainingCooldowns.get(ability) || 0
  }

  useAbility(ability: UnitAbility) {
    this.remainingCooldowns.set(ability, ability.cooldown);
  }
}

export default Unit;
