import { EquipmentCategory, ItemCategory } from '../types';
import Sprite from "./Sprite";
import EquippedItem from './EquippedItem';
import InventoryItem from './InventoryItem';
import UnitClass from './UnitClass';
import { playSound } from '../utils/AudioUtils';
import Sounds from '../Sounds';
import { UnitAI } from '../UnitAI';
import { chainPromises, resolvedPromise } from '../utils/PromiseUtils';
import PlayerSprite from './PlayerSprite';
import { playAnimation } from '../utils/SpriteUtils';

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
    return new Promise(resolve => {
      this._regenLife();
      if (!!this.queuedOrder) {
        const { queuedOrder } = this;
        this.queuedOrder = null;
        return queuedOrder(this)
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
      /*.then(() => {
        return jwb.renderer.render();
      })*/;
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

  takeDamage(damage: number, sourceUnit: Unit = undefined): Promise<any> {
    const { map, playerUnit } = jwb.state;

    const promises: (() => Promise<any>)[] = [];
    if (this.sprite instanceof PlayerSprite) {
      const PlayerSpriteKeys = PlayerSprite.SpriteKeys;
      const sequence = [PlayerSpriteKeys.STANDING_DAMAGED];
      promises.push(() => playAnimation(this.sprite, sequence, 150));
    }

    promises.push(() => new Promise(resolve => {
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
      resolve();
    }));

    return chainPromises(promises);
  };
}

export default Unit;