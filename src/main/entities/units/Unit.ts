import Activity from './Activity';
import AIParameters from './controllers/AIParameters';
import { UnitController } from './controllers/UnitController';
import { UnitAbility } from './abilities/UnitAbility';
import { AbilityName } from './abilities/AbilityName';
import { PlayerUnitClass } from './PlayerUnitClass';
import { Faction } from './Faction';
import { calculateTotalIncomingDamage } from './UnitUtils';
import Equipment from '../../equipment/Equipment';
import EquipmentMap from '../../equipment/EquipmentMap';
import Coordinates from '../../geometry/Coordinates';
import Direction from '../../geometry/Direction';
import Animatable from '../../graphics/animations/Animatable';
import DynamicSprite from '../../graphics/sprites/DynamicSprite';
import InventoryMap from '../../items/InventoryMap';
import Entity from '../Entity';
import { checkArgument } from '../../utils/preconditions';
import UnitModel from '../../schemas/UnitModel';
import Sprite from '../../graphics/sprites/Sprite';
import { EntityType } from '../EntityType';
import UnitType from '../../schemas/UnitType';
import { GameState } from '../../core/GameState';
import { Session } from '../../core/Session';
import MapInstance from '../../maps/MapInstance';

/**
 * Regenerate this raw amount of health each turn
 */
const LIFE_PER_TURN = 0.5;
/**
 * Regenerate this raw amount of mana each turn
 */
const MANA_PER_TURN = 1;

let nextId: number = 0;

type Props = Readonly<{
  name: string;
  faction: Faction;
  model: UnitModel;
  playerUnitClass?: PlayerUnitClass;
  sprite: DynamicSprite<Unit>;
  level: number;
  coordinates: Coordinates;
  map: MapInstance;
  controller: UnitController;
  equipment: Equipment[];
}>;

export type DefendResult = Readonly<{
  incomingDamage: number;
  damageTaken: number;
  damageAbsorbed: number;
}>;

export default class Unit implements Entity, Animatable {
  /** integer, starts at 0 */
  private readonly id: number;
  private readonly faction: Faction;
  private readonly sprite: DynamicSprite<Unit>;
  private readonly inventory: InventoryMap;
  private readonly equipment: EquipmentMap;
  private readonly aiParameters: AIParameters | null;
  private readonly playerUnitClass: PlayerUnitClass | null;
  private readonly experienceRewarded: number | null;
  private coordinates: Coordinates;
  private map: MapInstance;
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
  private experience: number;
  private lifetimeManaSpent: number;
  private lifetimeStepsTaken: number;

  constructor(props: Props) {
    this.id = nextId++;
    this.faction = props.faction;
    this.sprite = props.sprite;
    this.playerUnitClass = props.playerUnitClass ?? null;
    this.sprite.bind(this);
    this.inventory = new InventoryMap();

    this.coordinates = props.coordinates;
    this.map = props.map;
    this.name = props.name;
    this.level = 1;
    this.abilityPoints = 0;
    this.lifetimeDamageDealt = 0;
    this.lifetimeDamageTaken = 0;
    this.experience = 0;
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
    this.experienceRewarded = model.experience ?? null;
    this.controller = props.controller;
    this.activity = Activity.STANDING;
    this.direction = Direction.getDefaultUnitDirection();
    this.frameNumber = 1;
    this.abilities = model.abilities.map(abilityName =>
      UnitAbility.abilityForName(abilityName as AbilityName)
    );
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
  getExperienceRewarded = (): number | null => this.experienceRewarded;

  /** @override */
  getCoordinates = (): Coordinates => this.coordinates;

  /** @override */
  setCoordinates = (coordinates: Coordinates) => {
    this.coordinates = coordinates;
  };

  /** @override {@link Entity#getMap} */
  getMap = (): MapInstance => this.map;

  /** @override {@link Entity#setMap} */
  setMap = (map: MapInstance) => {
    this.map = map;
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
  setDirection = (direction: Direction) => {
    this.direction = direction;
  };
  getFrameNumber = () => this.frameNumber;
  getAbilities = () => this.abilities;
  hasAbility = (abilityName: AbilityName): boolean =>
    this.abilities.some(ability => ability.name === abilityName);

  /**
   * @override
   */
  getSprite = (): Sprite => this.sprite;

  getSummonedUnitClass = () => this.summonedUnitClass;

  /** @override */
  playTurnAction = async (state: GameState, session: Session) => {
    this._upkeep();
    if (this.stunDuration === 0) {
      const order = this.controller.issueOrder(this, state, session);
      await order.execute(this, state, session);
    }
    this._endOfTurn();
  };

  /** @override */
  isBlocking = (): boolean => true;

  /**
   * @param amount the *actual* amount of damage dealt
   *        (not counting mitigated damage, overkill, etc.)
   */
  recordDamageDealt = (amount: number) => {
    this.lifetimeDamageDealt += amount;
  };

  gainExperience = (amount: number) => {
    this.experience += amount;
  };

  recordStepTaken = () => {
    this.lifetimeStepsTaken++;
  };

  getKillsToNextLevel = (): number | null => {
    if (this.playerUnitClass) {
      return this.playerUnitClass.getCumulativeKillsToNextLevel(this.level);
    }
    return null;
  };

  getLifetimeDamageDealt = (): number => this.lifetimeDamageDealt;
  getLifetimeDamageTaken = (): number => this.lifetimeDamageTaken;
  getLifetimeKills = (): number => this.experience;
  getLifetimeManaSpent = (): number => this.lifetimeManaSpent;
  getLifetimeStepsTaken = (): number => this.lifetimeStepsTaken;

  takeDamage = (incomingDamage: number, sourceUnit: Unit | null): DefendResult => {
    const damageTaken = Math.min(
      calculateTotalIncomingDamage(this, incomingDamage, sourceUnit),
      this.life
    );
    const damageAbsorbed = incomingDamage - damageTaken;
    this.life -= damageTaken;
    this.lifetimeDamageTaken += damageTaken;

    return {
      incomingDamage,
      damageTaken,
      damageAbsorbed
    };
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
  getAnimationKey = () =>
    `${this.activity.toLowerCase()}_${Direction.toString(this.direction)}_${
      this.frameNumber
    }`;

  canSpendMana = (amount: number) => this.mana >= amount;

  spendMana = (amount: number) => {
    checkArgument(amount <= this.mana);
    checkArgument(amount >= 0);
    this.mana -= amount;
    this.lifetimeManaSpent += amount;
  };

  isInCombat = () =>
    this.turnsSinceCombatAction !== null && this.turnsSinceCombatAction <= 10;

  refreshCombat = () => {
    this.turnsSinceCombatAction = 0;
  };

  setActivity = (
    activity: Activity,
    frameNumber: number,
    direction: Direction | null
  ) => {
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

  getLearnableAbilities = (): AbilityName[] => {
    if (this.playerUnitClass) {
      return this.playerUnitClass
        .getLearnableAbilities()
        .filter(abilityName => !this.hasAbility(abilityName));
    }
    return [];
  };

  getPlayerUnitClass = (): PlayerUnitClass | null => this.playerUnitClass;

  private _upkeep = () => {
    // life regeneration
    this.lifeRemainder += LIFE_PER_TURN;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = Math.min(this.life + deltaLife, this.maxLife);

    // mana regeneration
    if (this.mana !== null && this.maxMana !== null) {
      this.manaRemainder += MANA_PER_TURN;
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

  getStrength = (): number => this.strength;
  getDexterity = (): number => this.dexterity;
}
