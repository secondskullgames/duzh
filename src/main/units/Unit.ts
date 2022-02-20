import { gameOver } from '../core/actions';
import GameState from '../core/GameState';
import DynamicSprite from '../graphics/sprites/DynamicSprite';
import Equipment from '../equipment/Equipment';
import EquipmentMap from '../equipment/EquipmentMap';
import InventoryMap from '../objects/items/InventoryMap';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Activity from '../types/Activity';
import Coordinates from '../types/Coordinates';
import Direction from '../types/Direction';
import { Entity, EquipmentSlot, Faction } from '../types/types';
import UnitController from './controllers/UnitController';
import UnitAbility from './UnitAbility';
import UnitClass from './UnitClass';

// Regenerate 1% of life every 5 turns
const LIFE_PER_TURN_MULTIPLIER = 0.002;
const MAX_PLAYER_LEVEL = 20;

type Props = {
  name: string,
  faction: Faction,
  unitClass: UnitClass,
  sprite: DynamicSprite<Unit>,
  level: number,
  coordinates: Coordinates,
  controller: UnitController,
  equipment: Equipment[]
};

class Unit implements Entity {
  readonly unitClass: UnitClass;
  readonly faction: Faction;
  readonly char = '@';
  readonly sprite: DynamicSprite<Unit>;
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
  private damage: number;
  controller: UnitController;
  activity: Activity;
  direction: Direction;
  private readonly remainingCooldowns: Map<UnitAbility, number>;
  readonly abilities: UnitAbility[];
  stunDuration: number;

  constructor({ name, unitClass, faction, sprite, level, coordinates: { x, y }, controller, equipment }: Props) {
    this.unitClass = unitClass;
    this.faction = faction;
    this.sprite = sprite;
    sprite.target = this;
    this.inventory = new InventoryMap();

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
    this.damage = unitClass.startingDamage;
    this.controller = controller;
    this.activity = Activity.STANDING;
    this.direction = Direction.S;
    this.remainingCooldowns = new Map();
    this.abilities = (unitClass.abilities[1] || []).map(name => UnitAbility[name]);
    this.stunDuration = 0;

    this.equipment = new EquipmentMap();
    for (const eq of equipment) {
      this.equipment.add(eq);
      eq.attach(this);
    }

    while (this.level < level) {
      this._levelUp(false);
    }
  }

  private _upkeep = () => {
    // life regeneration
    const lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
    this.lifeRemainder += lifePerTurn;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = Math.min(this.life + deltaLife, this.maxLife);

    for (const [ability, cooldown] of this.remainingCooldowns.entries()) {
      this.remainingCooldowns.set(ability, Math.max(cooldown - 1, 0));
    }
  };

  private _endOfTurn = () => {
    // decrement stun duration
    this.stunDuration = Math.max(this.stunDuration - 1, 0);
  };

  update = async () => {
    await this._upkeep();
    if (this.stunDuration === 0) {
      await this.controller.issueOrder(this);
    }
    await this.sprite.getImage();
    await this._endOfTurn();
  };

  getDamage = (): number => {
    let damage = this.damage;

    for (const [slot, item] of this.equipment.getEntries()) {
      if (slot !== EquipmentSlot.RANGED_WEAPON) {
        damage += (item.damage || 0);
      }
    }

    return damage;
  };

  getRangedDamage = (): number => {
    let damage = this.damage;

    for (const [slot, item] of this.equipment.getEntries()) {
      switch (slot) {
        case EquipmentSlot.RANGED_WEAPON:
          damage += (item.damage || 0);
          break;
        case EquipmentSlot.MELEE_WEAPON:
          // do nothing
          break;
        default:
          damage += (item.damage || 0) / 2;
      }
    }

    return Math.round(damage);
  };

  private _levelUp = (withSound: boolean) => {
    this.level++;
    const lifePerLevel = this.unitClass.lifePerLevel;
    this.maxLife += lifePerLevel;
    this.life += lifePerLevel;
    this.damage += this.unitClass.damagePerLevel;
    const abilities = this.unitClass.abilities[this.level] || [];
    for (const abilityName of abilities) {
      this.abilities.push(UnitAbility[abilityName]);
    }

    if (withSound) {
      playSound(Sounds.LEVEL_UP);
    }
  };

  gainExperience = (experience: number) => {
    if (!this.unitClass.experienceToNextLevel) return;

    this.experience += experience;
    const experienceToNextLevel = this.experienceToNextLevel();
    while (experienceToNextLevel && this.experience >= experienceToNextLevel) {
      this.experience -= experienceToNextLevel;
      this._levelUp(true);
    }
  };

  experienceToNextLevel = (): (number | null) => {
    const { unitClass } = this;
    if (unitClass.experienceToNextLevel && (this.level < MAX_PLAYER_LEVEL)) {
      return unitClass.experienceToNextLevel[this.level];
    }
    return null;
  };

  takeDamage = async (damage: number, sourceUnit?: Unit) => {
    const state = GameState.getInstance();
    const { playerUnit } = state;
    const map = state.getMap();

    this.life = Math.max(this.life - damage, 0);
    if (this.life === 0) {
      map.removeUnit(this);
      if (this === playerUnit) {
        await gameOver();
        return;
      } else {
        playSound(Sounds.ENEMY_DIES);
      }

      if (sourceUnit && sourceUnit === playerUnit) {
        sourceUnit.gainExperience(1);
      }
    }
  };

  getCooldown = (ability: UnitAbility): number => (this.remainingCooldowns.get(ability) || 0);

  triggerCooldown = (ability: UnitAbility)  => this.remainingCooldowns.set(ability, ability.cooldown);
}

export default Unit;
