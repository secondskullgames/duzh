import Equipment from '../../equipment/Equipment';
import EquipmentMap from '../../equipment/EquipmentMap';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Animatable from '../../graphics/animations/Animatable';
import DynamicSprite from '../../graphics/sprites/DynamicSprite';
import InventoryMap from '../../items/InventoryMap';
import { isInStraightLine } from '../../maps/MapUtils';
import Activity from '../../types/Activity';
import Entity from '../Entity';
import { Faction } from '../../types/types';
import { checkArgument } from '../../utils/preconditions';
import AIParameters from './controllers/AIParameters';
import UnitController from './controllers/UnitController';
import { type UnitAbility, AbilityName } from './abilities/UnitAbility';
import UnitModel from '../../schemas/UnitModel';
import Sprite from '../../graphics/sprites/Sprite';
import { levelUp } from '../../actions/levelUp';
import { EntityType } from '../EntityType';
import { abilityForName } from './abilities/abilityForName';

/**
 * Regenerate this fraction of the unit's health each turn
 */
const LIFE_PER_TURN_MULTIPLIER = 0.01 / 2;
/**
 * Only regenerate life if the unit's life is less than this (ratio of their total health)
 */
const LIFE_REGEN_THRESHOLD = 1;
const MAX_PLAYER_LEVEL = 20;

// TODO hardcoding this player-specific stuff here
const experienceToNextLevel = [4, 6, 8, 10, 12, 14, 16, 18, 20];

type Props = Readonly<{
  name: string,
  faction: Faction,
  model: UnitModel,
  sprite: DynamicSprite<Unit>,
  level: number,
  coordinates: Coordinates,
  controller: UnitController,
  equipment: Equipment[]
}>;

export default class Unit implements Entity, Animatable {
  private readonly faction: Faction;
  private readonly sprite: DynamicSprite<Unit>;
  private readonly inventory: InventoryMap;
  private readonly equipment: EquipmentMap;
  private readonly aiParameters: AIParameters | null;
  private coordinates: Coordinates;
  private readonly name: string;
  private level: number;
  private experience: number;
  private life: number;
  private maxLife: number;
  private mana: number;
  private maxMana: number;
  private lifeRemainder: number;
  private manaRemainder: number;
  private damage: number;
  private readonly controller: UnitController;
  private activity: Activity;
  private direction: Direction;
  /**
   * For now, this is not auto-incremented and only used for certain animations (see Animations.ts)
   */
  private frameNumber: number;
  private readonly abilities: UnitAbility[];
  private stunDuration: number;
  /**
   * Used by AI to make certain decisions
   */
  private turnsSinceCombatAction: number | null;
  private readonly abilitiesPerLevel: Record<string, string[]>;
  private readonly summonedUnitClass: string | null;

  constructor(props: Props) {
    this.faction = props.faction;
    this.sprite = props.sprite;
    this.sprite.target = this;
    this.inventory = new InventoryMap();

    this.coordinates = props.coordinates;
    this.name = props.name;
    this.level = 1;
    this.experience = 0;

    const { model } = props;
    this.life = model.life;
    this.maxLife = model.life;
    this.mana = model.mana;
    this.maxMana = model.mana;
    this.lifeRemainder = 0;
    this.manaRemainder = 0;
    this.damage = model.damage;
    this.controller = props.controller;
    this.activity = 'STANDING';
    this.direction = Direction.S;
    this.frameNumber = 1;
    // TODO make this type safe
    this.abilities = (model.abilities[1] ?? [])
      .map(str => str as AbilityName)
      .map(abilityForName);
    this.stunDuration = 0;
    this.turnsSinceCombatAction = null;

    this.aiParameters = model.aiParameters ?? null;
    this.abilitiesPerLevel = model.abilities;
    this.summonedUnitClass = model.summonedUnitClass ?? null;

    this.equipment = new EquipmentMap();
    for (const eq of props.equipment) {
      this.equipment.add(eq);
      eq.attach(this);
    }

    while (this.level < props.level) {
      levelUp(this);
    }
  }

  private _upkeep = () => {
    // life regeneration
    if (this.life < this.maxLife * LIFE_REGEN_THRESHOLD) {
      const lifePerTurn = this.maxLife * LIFE_PER_TURN_MULTIPLIER;
      this.lifeRemainder += lifePerTurn;
      const deltaLife = Math.floor(this.lifeRemainder);
      this.lifeRemainder -= deltaLife;
      this.life = Math.min(this.life + deltaLife, this.maxLife);
    }

    // mana regeneration
    if (this.mana !== null && this.maxMana !== null) {
      const manaPerTurn = 1;
      this.manaRemainder += manaPerTurn;
      const deltaMana = Math.floor(this.manaRemainder);
      this.manaRemainder -= deltaMana;
      this.mana = Math.min(this.mana + deltaMana, this.maxMana);
    }

    if (this.turnsSinceCombatAction !== null) {
      this.turnsSinceCombatAction++;
    }
  };

  private _endOfTurn = () => {
    // decrement stun duration
    this.stunDuration = Math.max(this.stunDuration - 1, 0);
  };

  getAiParameters = (): AIParameters | null => this.aiParameters;
  getName = (): string => this.name;
  getFaction = (): Faction => this.faction;
  getController = (): UnitController => this.controller;

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;

  /** @override */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  getLife = () => this.life;
  getMaxLife = () => this.maxLife;
  getMana = () => this.mana;
  getMaxMana = () => this.maxMana;
  getLevel = () => this.level;
  getExperience = () => this.experience;
  getInventory = (): InventoryMap => this.inventory;
  getEquipment = (): EquipmentMap => this.equipment;
  getActivity = () => this.activity;
  getDirection = () => this.direction;
  setDirection = (direction: Direction) => { this.direction = direction; };
  getFrameNumber = () => this.frameNumber;
  getAbilities = () => this.abilities;

  /**
   * @override
   */
  getSprite = (): Sprite => this.sprite;

  getSummonedUnitClass = () => this.summonedUnitClass;

  /** @override */
  update = async () => {
    await this._upkeep();
    if (this.stunDuration === 0) {
      await this.controller.issueOrder(this);
    }
    await this.sprite.getImage();
    await this._endOfTurn();
  };

  /** @override */
  isBlocking = (): boolean => true;

  getDamage = (): number => {
    let damage = this.damage;

    for (const equipment of this.equipment.getAll()) {
      if (equipment.slot !== 'RANGED_WEAPON') {
        damage += (equipment.damage ?? 0);
      }
    }

    return damage;
  };

  getRangedDamage = (): number => {
    let damage = this.damage;

    for (const equipment of this.equipment.getAll()) {
      switch (equipment.slot) {
        case 'RANGED_WEAPON':
          damage += (equipment.damage ?? 0);
          break;
        case 'MELEE_WEAPON':
          // do nothing
          break;
        default:
          damage += (equipment.damage ?? 0) / 2;
      }
    }

    return Math.round(damage);
  };

  gainExperience = (amount: number) => {
    this.experience += amount;
  };

  experienceToNextLevel = (): (number | null) => {
    if (this.faction === 'PLAYER' && (this.level < MAX_PLAYER_LEVEL)) {
      return experienceToNextLevel[this.level];
    }
    return null;
  };

  private _calculateIncomingDamage = (baseDamage: number, sourceUnit: Unit | null): number => {
    let adjustedDamage = baseDamage;
    for (const equipment of this.equipment.getAll()) {
      if (equipment.absorbAmount !== null) {
        adjustedDamage = Math.round(adjustedDamage * (1 - (equipment.absorbAmount ?? 0)));
      }
      if (equipment.blockAmount !== null) {
        if (sourceUnit !== null && isInStraightLine(this.getCoordinates(), sourceUnit.getCoordinates())) {
          adjustedDamage = Math.round(adjustedDamage * (1 - (equipment.blockAmount ?? 0)));
        }
      }
    }
    return Math.max(adjustedDamage, 0);
  };

  takeDamage = (amount: number, sourceUnit: Unit | null): number => {
    const adjustedDamage = this._calculateIncomingDamage(amount, sourceUnit);
    this.life = Math.max(this.life - amount, 0);
    return adjustedDamage;
  };

  /**
   * @return the amount of life gained
   */
  gainLife = (life: number): number => {
    const lifeGained = Math.min(life, this.maxLife - this.life);
    this.life += lifeGained;
    return lifeGained;
  };

  /**
   * @return the amount of mana gained
   */
  gainMana = (mana: number): number => {
    const manaGained = Math.min(mana, this.maxMana - this.mana);
    this.mana += manaGained;
    return manaGained;
  };

  /**
   * @override {@link Animatable#getAnimationKey}
   */
  getAnimationKey = () => `${this.activity.toLowerCase()}_${Direction.toString(this.direction)}_${this.frameNumber}`;

  canSpendMana = (amount: number) => this.mana >= amount;

  spendMana = (amount: number) => {
    checkArgument(amount <= this.mana);
    checkArgument(amount >= 0);
    this.mana -= amount;
  };

  isInCombat = () => this.turnsSinceCombatAction !== null && this.turnsSinceCombatAction <= 10;
  refreshCombat = () => { this.turnsSinceCombatAction = 0; };

  setActivity = (activity: Activity, frameNumber: number, direction: Direction | null) => {
    this.activity = activity;
    this.frameNumber = frameNumber ?? 1;
    this.direction = direction ?? this.direction;
  };

  setStunned = (duration: number) => {
    this.stunDuration = Math.max(this.stunDuration, duration);
  };

  /**
   * @override {@link Entity#getType}
   */
  getType = (): EntityType => EntityType.UNIT;

  incrementLevel = () => {
    this.level++;
  };

  incrementMaxLife = (amount: number) => {
    this.maxLife += amount;
  };

  incrementMaxMana = (amount: number) => {
    this.maxMana += amount;
  };

  incrementDamage = (amount: number) => {
    this.damage += amount;
  };

  addAbility = (ability: UnitAbility) => {
    this.abilities.push(ability);
  };

  getNewAbilities = (level: number): string[] => {
    return this.abilitiesPerLevel[level] ?? [];
  };
}
