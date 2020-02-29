import { Entity, Coordinates } from '../types';
import Sprite from './Sprite';
import UnitClass from './UnitClass';
import { playSound } from '../utils/AudioUtils';
import Sounds from '../Sounds';
import { UnitAI } from '../UnitAI';
import { chainPromises, resolvedPromise } from '../utils/PromiseUtils';
import PlayerSprite from './PlayerSprite';
import { playAnimation } from '../utils/SpriteUtils';
import InventoryMap from './InventoryMap';
import EquipmentMap from './EquipmentMap';

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

  constructor(unitClass: UnitClass, name: string, level: number, { x, y }: Coordinates) {
    this.unitClass = unitClass;
    this.sprite = unitClass.sprite(unitClass.paletteSwaps);
    this.inventory = new InventoryMap();
    this.equipment = new EquipmentMap();

    this.x = x;
    this.y = y;
    this.name = name;
    this.level = level;
    this.experience = 0;
    this.life = unitClass.startingLife;
    this.maxLife = unitClass.startingLife;
    this.mana = unitClass.startingMana;
    this.maxMana = unitClass.startingMana;
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
      });
  }

  getDamage(): number {
    let damage = this._damage;
    this.equipment.getEntries().forEach(([category, items]) => {
      items.forEach(item => {
        damage += (item.damage || 0);
      });
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

  gainExperience(experience: number) {
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

  takeDamage(damage: number, sourceUnit: (Unit | undefined) = undefined): Promise<any> {
    const { playerUnit } = jwb.state;
    const map = jwb.state.getMap();

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