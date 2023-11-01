import Activity from './Activity';
import AIParameters from './controllers/AIParameters';
import { UnitController } from './controllers/UnitController';
import { type UnitAbility } from './abilities/UnitAbility';
import { abilityForName } from './abilities/abilityForName';
import { AbilityName } from './abilities/AbilityName';
import Equipment from '../../equipment/Equipment';
import EquipmentMap from '../../equipment/EquipmentMap';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Animatable from '../../graphics/animations/Animatable';
import DynamicSprite from '../../graphics/sprites/DynamicSprite';
import InventoryMap from '../../items/InventoryMap';
import { isInStraightLine } from '../../maps/MapUtils';
import Entity, { UpdateContext } from '../Entity';
import { Faction } from '../../types/types';
import { checkArgument } from '../../utils/preconditions';
import UnitModel from '../../schemas/UnitModel';
import Sprite from '../../graphics/sprites/Sprite';
import { EntityType } from '../EntityType';
import UnitType from '../../schemas/UnitType';

/**
 * Regenerate this raw amount of health each turn
 */
const LIFE_PER_TURN = 1 / 2;
const MAX_PLAYER_LEVEL = 20;

// TODO hardcoding this player-specific stuff here
const cumulativeKillsToNextLevel = [
  4,  // 4,
  10, // 6,
  18, // 8,
  28, // 10,
  40, // 12,
  54, // 14,
  70, // 16,
  88, // 18,
  108 // 20
];

let nextId: number = 0;

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
  /** integer, starts at 0 */
  private readonly id: number;
  private readonly faction: Faction;
  private readonly sprite: DynamicSprite<Unit>;
  private readonly inventory: InventoryMap;
  private readonly equipment: EquipmentMap;
  private readonly aiParameters: AIParameters | null;
  private coordinates: Coordinates;
  private readonly name: string;
  private level: number;
  private abilityPoints: number;
  private life: number;
  private maxLife: number;
  private mana: number;
  private maxMana: number;
  private lifeRemainder: number;
  private manaRemainder: number;
  private strength: number;
  private dexterity: number;
  private readonly unitClass: string;
  private readonly unitType: UnitType;
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
  private readonly summonedUnitClass: string | null;

  private lifetimeDamageDealt: number;
  private lifetimeDamageTaken: number;
  private lifetimeKills: number;
  private lifetimeManaSpent: number;
  private lifetimeStepsTaken: number;

  constructor(props: Props) {
    this.id = nextId++;
    this.faction = props.faction;
    this.sprite = props.sprite;
    this.sprite.bind(this);
    this.inventory = new InventoryMap();

    this.coordinates = props.coordinates;
    this.name = props.name;
    this.level = 1;
    this.abilityPoints = 0;
    this.lifetimeDamageDealt = 0;
    this.lifetimeDamageTaken = 0;
    this.lifetimeKills = 0;
    this.lifetimeManaSpent = 0;
    this.lifetimeStepsTaken = 0;

    const { model } = props;
    this.life = model.life;
    this.maxLife = model.life;
    this.mana = model.mana;
    this.maxMana = model.mana;
    this.lifeRemainder = 0;
    this.manaRemainder = 0;
    this.strength = model.strength;
    this.dexterity = model.dexterity;
    this.unitClass = model.id;
    this.unitType = model.type;
    this.controller = props.controller;
    this.activity = Activity.STANDING;
    this.direction = Direction.S;
    this.frameNumber = 1;
    // TODO make this type safe
    this.abilities = model.abilities //
      .map(str => str as AbilityName)
      .map(abilityForName);
    this.stunDuration = 0;
    this.turnsSinceCombatAction = null;

    this.aiParameters = model.aiParameters ?? null;
    this.summonedUnitClass = model.summonedUnitClass ?? null;

    this.equipment = new EquipmentMap();
    for (const eq of props.equipment) {
      this.equipment.add(eq);
      eq.attach(this);
    }

    /*while (this.level < props.level) {
      levelUp(this, { state });
    }*/
  }

  getId = (): number => this.id;
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
  getInventory = (): InventoryMap => this.inventory;
  getEquipment = (): EquipmentMap => this.equipment;
  getActivity = () => this.activity;
  getDirection = () => this.direction;
  setDirection = (direction: Direction) => { this.direction = direction; };
  getFrameNumber = () => this.frameNumber;
  getAbilities = () => this.abilities;
  hasAbility = (abilityName: AbilityName): boolean => {
    return !!this.abilities.find(ability => ability.name === abilityName);
  }

  /**
   * @override
   */
  getSprite = (): Sprite => this.sprite;

  getSummonedUnitClass = () => this.summonedUnitClass;

  /** @override */
  update = async ({ state, map, imageFactory, ticker }: UpdateContext) => {
    this._upkeep();
    if (this.stunDuration === 0) {
      const order = this.controller.issueOrder(this, { state, map });
      await order.execute(this, { state, map, imageFactory, ticker });
    }
    this._endOfTurn();
  };

  /** @override */
  isBlocking = (): boolean => true;

  getMeleeDamage = (): number => {
    let damage = this.strength;

    for (const equipment of this.equipment.getAll()) {
      if (equipment.slot !== 'RANGED_WEAPON') {
        damage += (equipment.damage ?? 0);
      }
    }

    return damage;
  };

  /**
   * @param amount the *actual* amount of damage dealt
   *        (not counting mitigated damage, overkill, etc.)
   */
  recordDamageDealt = (amount: number) => {
    this.lifetimeDamageDealt += amount;
  };

  recordKill = () => {
    this.lifetimeKills++;
  };

  recordStepTaken = () => {
    this.lifetimeStepsTaken++;
  };

  getRangedDamage = (): number => {
    let damage = this.dexterity;

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

  getKillsToNextLevel = (): (number | null) => {
    if (this.faction === Faction.PLAYER && (this.level < MAX_PLAYER_LEVEL)) {
      return cumulativeKillsToNextLevel[this.level - 1];
    }
    return null;
  };

  getLifetimeDamageDealt = (): number => this.lifetimeDamageDealt;
  getLifetimeDamageTaken = (): number => this.lifetimeDamageTaken;
  getLifetimeKills = (): number => this.lifetimeKills;
  getLifetimeManaSpent = (): number => this.lifetimeManaSpent;
  getLifetimeStepsTaken = (): number => this.lifetimeStepsTaken;

  /**
   * @return the actual amount of damage taken, after mitigation and not including overkill
   */
  takeDamage = (amount: number, sourceUnit: Unit | null): number => {
    const adjustedDamage = this._calculateIncomingDamage(amount, sourceUnit);
    const actualDamageTaken = Math.min(adjustedDamage, this.life);
    this.life -= actualDamageTaken;
    this.lifetimeDamageTaken += actualDamageTaken;
    return actualDamageTaken;
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
    this.lifetimeManaSpent += amount;
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

  getUnitClass = (): string => this.unitClass;
  getUnitType = (): UnitType => this.unitType;

  incrementLevel = () => {
    this.level++;
  };

  increaseMaxLife = (amount: number) => {
    this.maxLife += amount;
  };

  increaseMaxMana = (amount: number) => {
    this.maxMana += amount;
  };

  increaseStrength = (amount: number) => {
    this.strength += amount;
  };

  learnAbility = (ability: UnitAbility) => {
    this.abilities.push(ability);
    this.abilityPoints--;
  };

  awardAbilityPoint = () => {
    this.abilityPoints++;
  };

  getAbilityPoints = (): number => {
    return this.abilityPoints;
  };

  /**
   * TODO this should probably be somewhere player-specific,
   * not in the base Unit class
   */
  getLearnableAbilities = (): AbilityName[] => {
    const LEARNABLE_ABILITIES = [
      AbilityName.BLINK,
      AbilityName.DASH,
      AbilityName.HEAVY_ATTACK,
      AbilityName.KNOCKBACK_ATTACK,
      AbilityName.SHOOT_FIREBALL,
      AbilityName.STUN_ATTACK
    ];
    return LEARNABLE_ABILITIES.filter(ability => !this.hasAbility(ability));
  };

  private _upkeep = () => {
    // life regeneration
    this.lifeRemainder += LIFE_PER_TURN;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = Math.min(this.life + deltaLife, this.maxLife);

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

  getStrength = (): number => this.strength;
  getDexterity = (): number => this.dexterity;
}
