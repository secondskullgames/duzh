import { UnitController } from './controllers/UnitController';
import { PlayerUnitClass } from './PlayerUnitClass';
import { Faction } from './Faction';
import { calculateTotalIncomingDamage } from './UnitUtils';
import { Activity } from './Activity';
import Equipment from '../equipment/Equipment';
import EquipmentMap from '../equipment/EquipmentMap';
import DynamicSprite from '../graphics/sprites/DynamicSprite';
import InventoryMap from '../items/InventoryMap';
import Entity from '../entities/Entity';
import Sprite from '../graphics/sprites/Sprite';
import { EntityType } from '../entities/EntityType';
import MapInstance from '../maps/MapInstance';
import { AbilityName } from '@main/abilities/AbilityName';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { AIParameters } from '@models/AIParameters';
import { UnitType } from '@models/UnitType';
import { UnitModel } from '@models/UnitModel';
import { Direction } from '@lib/geometry/Direction';
import { Coordinates } from '@lib/geometry/Coordinates';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import { check, checkArgument, checkNotNull } from '@lib/utils/preconditions';
import { die } from '@main/actions/die';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { UnitStatusEffects } from '@main/units/effects/UnitStatusEffects';
import { dealDamage } from '@main/actions/dealDamage';
import { Feature } from '@main/utils/features';

/**
 * Regenerate this raw amount of mana each turn
 * (can be decimal)
 */
const STARTING_MANA_PER_TURN = 1;

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

export default class Unit implements Entity {
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
  private lifePerTurn: number;
  private manaPerTurn: number;
  private meleeDamage: number;
  private rangedDamge: number;
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

  private readonly effects: UnitStatusEffects;

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
    this.lifePerTurn = Unit._getStartingLifePerTurn(props);
    this.manaPerTurn = STARTING_MANA_PER_TURN; // TODO move to model?
    this.meleeDamage = model.meleeDamage;
    this.rangedDamge = model.rangedDamage;
    this.unitClass = model.id;
    this.unitType = model.type;
    this.experienceRewarded = model.experience ?? null;
    this.controller = props.controller;
    this.activity = Activity.STANDING;
    this.direction = Direction.getDefaultUnitDirection();
    this.frameNumber = 1;
    this.abilities = model.abilities.map(abilityName =>
      UnitAbility.createAbilityForName(abilityName as AbilityName)
    );
    this.turnsSinceCombatAction = null;

    this.aiParameters = model.aiParameters ?? null;
    this.summonedUnitClass = model.summonedUnitClass ?? null;

    this.equipment = new EquipmentMap();
    for (const eq of props.equipment) {
      this.equipment.add(eq);
      eq.attach(this);
      if (eq.ability) {
        this.learnAbility(eq.ability);
      }
    }

    this.effects = new UnitStatusEffects();
  }

  private static _getStartingLifePerTurn = (props: Props): number => {
    if (Feature.isEnabled(Feature.NEGATIVE_REGEN)) {
      return props.playerUnitClass ? -0.25 : 0;
    } else {
      return 0.5;
    }
  };

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
  getLifePerTurn = () => this.lifePerTurn;
  getMana = () => this.mana;
  getMaxMana = () => this.maxMana;
  getManaPerTurn = () => this.manaPerTurn;
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

  getAbilityForName = (abilityName: AbilityName): UnitAbility =>
    checkNotNull(this.abilities.find(ability => ability.name === abilityName));

  /**
   * @override
   */
  getSprite = (): Sprite => this.sprite;

  getSummonedUnitClass = () => this.summonedUnitClass;

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
    this.effects.removeEffect(StatusEffect.FROZEN);

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
    this.effects.addEffect(StatusEffect.STUNNED, duration);
  };

  setFrozen = (duration: number) => {
    this.effects.addEffect(StatusEffect.FROZEN, duration);
  };

  setBurning = (duration: number) => {
    this.effects.addEffect(StatusEffect.BURNING, duration);
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

  increaseLifePerTurn = (amount: number) => {
    this.lifePerTurn += amount;
  };

  increaseManaPerTurn = (amount: number) => {
    this.manaPerTurn += amount;
  };

  increaseMeleeDamage = (amount: number) => {
    this.meleeDamage += amount;
  };

  increaseRangedDamage = (amount: number) => {
    this.rangedDamge += amount;
  };

  learnAbility = (ability: UnitAbility) => {
    this.abilities.push(ability);
  };

  unlearnAbility = (ability: UnitAbility) => {
    const index = this.abilities.indexOf(ability);
    check(index >= 0);
    this.abilities.splice(index, 1);
  };

  awardAbilityPoint = () => {
    this.abilityPoints++;
  };

  spendAbilityPoint = () => {
    check(this.abilityPoints > 0);
    this.abilityPoints--;
  };

  getAbilityPoints = (): number => {
    return this.abilityPoints;
  };

  getPlayerUnitClass = (): PlayerUnitClass | null => this.playerUnitClass;

  upkeep = async (state: GameState, session: Session) => {
    // life regeneration
    this.lifeRemainder += this.lifePerTurn;
    const deltaLife = Math.floor(this.lifeRemainder);
    this.lifeRemainder -= deltaLife;
    this.life = this.life + deltaLife;
    if (this.life > this.getMaxLife()) {
      this.life = this.getMaxLife();
    }
    if (this.life <= 0) {
      await die(this, state, session);
    }

    // mana regeneration
    if (this.mana !== null && this.maxMana !== null) {
      this.manaRemainder += this.manaPerTurn;
      const deltaMana = Math.floor(this.manaRemainder);
      this.manaRemainder -= deltaMana;
      this.mana = Math.min(this.mana + deltaMana, this.maxMana);
    }

    if (this.turnsSinceCombatAction !== null) {
      this.turnsSinceCombatAction++;
    }
  };

  endOfTurn = async (state: GameState, session: Session) => {
    for (const effect of this.effects.getEffects()) {
      switch (effect) {
        case StatusEffect.BURNING:
          await dealDamage(2, { targetUnit: this });
          if (this.life <= 0) {
            await die(this, state, session);
          }
          break;
        default:
          break;
      }
    }
    this.effects.decrement();
  };

  getMeleeDamage = (): number => this.meleeDamage;
  getRangedDamage = (): number => this.rangedDamge;

  getEffects = (): UnitStatusEffects => this.effects;

  canMove = (): boolean => {
    return (
      !this.effects.hasEffect(StatusEffect.FROZEN) &&
      !this.effects.hasEffect(StatusEffect.STUNNED)
    );
  };
}
