import { EquipmentCategory, ItemCategory } from '../types';
import Sprite from "./Sprite";
import EquippedItem from './EquippedItem';
import InventoryItem from './InventoryItem';
import UnitClass from './UnitClass';
import { playSound } from '../audio';
import Sounds from '../Sounds';
import { UnitAI } from '../UnitAI';

const LIFE_PER_TURN_MULTIPLIER = 0.005;
class Unit {
  readonly class: string;
  readonly unitClass: UnitClass;
  readonly sprite: Sprite;
  inventory: { [category in ItemCategory]?: InventoryItem[] };
  equipment: { [category in EquipmentCategory]?: EquippedItem[] };
  x: number;
  y: number;
  name: string;
  level: number;
  experience: number;
  life: number;
  maxLife: number;
  lifeRemainder: number;
  private _damage: number;
  queuedOrder?: (Unit) => Promise<void>;
  aiHandler?: UnitAI;

  constructor(unitClass: UnitClass, name, level, { x, y }) {
    this.class = 'Unit';
    this.unitClass = unitClass;
    this.sprite = unitClass.sprite(unitClass);
    this.inventory = {};
    Object.keys(ItemCategory).forEach(category => {
      this.inventory[category] = [];
    });

    this.equipment = {};
    Object.keys(EquipmentCategory).forEach(category => {
      this.equipment[category] = [];
    });

    this.x = x;
    this.y = y;
    this.name = name;
    this.level = level;
    this.experience = 0;
    this.maxLife = unitClass.startingLife;
    this.life = unitClass.startingLife;
    this.lifeRemainder = 0;
    this._damage = unitClass.startingDamage;
    this.queuedOrder = null;
    this.aiHandler = unitClass.aiHandler;
  }

  _regenLife() {
    const lifePerTurn = (this.maxLife) * LIFE_PER_TURN_MULTIPLIER;
    this.lifeRemainder += lifePerTurn;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = Math.min(this.life + deltaLife, this.maxLife);
  };

  update(): Promise<void> {
    return new Promise(resolve => resolve())
      .then(() => {
        this._regenLife();
      })
      .then(() => {
        if (!!this.queuedOrder) {
          const { queuedOrder } = this;
          this.queuedOrder = null;
          return queuedOrder(this);
        }
        return new Promise(resolve => { resolve(); });
      })
      .then(() => {
        if (!!this.aiHandler) {
          return this.aiHandler(this);
        }

        return new Promise(resolve => { resolve(); });
    });
  }

  getDamage(): number {
    let damage = this._damage;
    Object.values(this.equipment)
      .flatMap(list => list)
      .forEach(equippedItem => {
        damage += (equippedItem.damage || 0);
      });
    return damage;
  }

  /**
   * @private
   */
  private _levelUp() {
    this.level++;
    const lifePerLevel = this.unitClass.lifePerLevel(this.level);
    this.maxLife += lifePerLevel;
    this.life += lifePerLevel;
    this._damage += this.unitClass.damagePerLevel(this.level);
    playSound(Sounds.LEVEL_UP);
  }

  gainExperience(experience) {
    this.experience += experience;
    const experienceToNextLevel = this.experienceToNextLevel();
    while (!!experienceToNextLevel && this.experience >= experienceToNextLevel) {
      this.experience -= experienceToNextLevel;
      this._levelUp();
    }
  }

  experienceToNextLevel(): (number | null) {
    const { unitClass } = this;
    if (unitClass.experienceToNextLevel && (this.level < unitClass.maxLevel)) {
      return unitClass.experienceToNextLevel(this.level);
    }
    return null;
  }

  /**
   * @param {!int} damage
   * @param {?Unit} sourceUnit
   *
   * @return void
   */
  takeDamage(damage, sourceUnit = undefined) {
    const { map, playerUnit } = jwb.state;

    this.life = Math.max(this.life - damage, 0);
    if (this.life === 0) {
      map.units = map.units.filter(u => u !== this);
      if (this === playerUnit) {
        alert('Game Over!');
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
  };
}

export default Unit;