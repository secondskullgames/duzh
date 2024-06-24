import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import Unit from '@main/units/Unit';
import { StatusEffect } from '@main/units/effects/StatusEffect';
import { gameOver } from '@main/actions/gameOver';
import Sounds from '@main/sounds/Sounds';
import { UnitType } from '@models/UnitType';
import { random, weightedRandom } from '@lib/utils/random';
import { Coordinates } from '@lib/geometry/Coordinates';
import MapInstance from '@main/maps/MapInstance';
import GameObject from '@main/objects/GameObject';
import {
  GLOBE_DROP_CHANCE,
  HEALTH_GLOBE_DROP_CHANCE,
  ITEM_DROP_CHANCE,
  MANA_GLOBE_DROP_CHANCE,
  VISION_GLOBE_DROP_CHANCE
} from '@main/units/UnitConstants';
import { getBonus, isBlocked } from '@main/maps/MapUtils';
import { EquipmentScript } from '@main/equipment/EquipmentScript';
import { Faction } from '@main/units/Faction';
import { checkNotNull } from '@lib/utils/preconditions';
import { Feature } from '@main/utils/features';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Direction } from '@lib/geometry/Direction';
import InventoryItem from '@main/items/InventoryItem';

export type DealDamageParams = Readonly<{
  sourceUnit?: Unit;
  targetUnit: Unit;
}>;

interface UnitApiShape {
  upkeep: (unit: Unit, state: GameState, session: Session) => Promise<void>;
  die: (unit: Unit, state: GameState, session: Session) => Promise<void>;
  endOfTurn: (unit: Unit, state: GameState, session: Session) => Promise<void>;
  moveUnit: (
    unit: Unit,
    coordinates: Coordinates,
    session: Session,
    state: GameState
  ) => Promise<void>;
  walk: (
    unit: Unit,
    direction: Direction,
    session: Session,
    state: GameState
  ) => Promise<void>;
  dealDamage: (baseDamage: number, params: DealDamageParams) => Promise<number>;
  levelUp: (unit: Unit, session: Session) => Promise<void>;
  useItem: (
    unit: Unit,
    item: InventoryItem,
    state: GameState,
    session: Session
  ) => Promise<void>;
  beforeAttack: (
    attacker: Unit,
    defender: Unit,
    state: GameState,
    session: Session
  ) => Promise<void>;
  afterAttack: (
    attacker: Unit,
    defender: Unit,
    state: GameState,
    session: Session
  ) => Promise<void>;
}

/**
 * Pure, static functions to execute core unit logic
 */
const upkeep = async (unit: Unit, state: GameState, session: Session) => {
  unit.doLifeRegeneration();
  if (unit.getLife() <= 0) {
    await die(unit, state, session);
  }

  unit.doManaRegeneration();

  unit.incrementTurnsSinceCombatAction();
};

const endOfTurn = async (unit: Unit, state: GameState, session: Session) => {
  for (const effect of unit.getEffects().getEffects()) {
    switch (effect) {
      case StatusEffect.BURNING:
        await dealDamage(2, { targetUnit: unit });
        if (unit.getLife() <= 0) {
          await die(unit, state, session);
        }
        break;
      default:
        break;
    }
  }
  unit.getEffects().decrement();
};

const die = async (unit: Unit, state: GameState, session: Session) => {
  const playerUnit = session.getPlayerUnit();
  const coordinates = unit.getCoordinates();
  const map = unit.getMap();

  map.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver(state, session);
    return;
  } else {
    state.getSoundPlayer().playSound(Sounds.ENEMY_DIES);
    session.getTicker().log(`${unit.getName()} dies!`, { turn: session.getTurn() });

    // TODO make this more systematic
    if (unit.getUnitType() === UnitType.WIZARD) {
      const key = await state.getItemFactory().createMapItem('key', coordinates, map);
      map.addObject(key);
    } else {
      if (_canDropItems(unit)) {
        const randomRoll = random();
        if (randomRoll < GLOBE_DROP_CHANCE) {
          const globe = await _createGlobe(coordinates, map, state);
          map.addObject(globe);
        } else if (randomRoll < GLOBE_DROP_CHANCE + ITEM_DROP_CHANCE) {
          const item = await state
            .getItemFactory()
            .createRandomItem(coordinates, map, state);
          map.addObject(item);
          session.getTicker().log(`${unit.getName()} dropped a ${item.getName()}.`, {
            turn: session.getTurn()
          });
        }
      }
    }
  }
};

/** @return the amount of adjusted damage taken */
const dealDamage = async (
  baseDamage: number,
  params: DealDamageParams
): Promise<number> => {
  const sourceUnit = params.sourceUnit ?? null;
  const targetUnit = params.targetUnit;
  const { damageTaken } = targetUnit.takeDamage(baseDamage, sourceUnit);
  sourceUnit?.refreshCombat();
  targetUnit.refreshCombat();
  return damageTaken;
};

const moveUnit = async (
  unit: Unit,
  coordinates: Coordinates,
  session: Session,
  state: GameState
) => {
  const map = unit.getMap();
  map.removeUnit(unit);

  unit.setCoordinates(coordinates);
  map.addUnit(unit);

  for (const equipment of unit.getEquipment().getAll()) {
    if (equipment.script) {
      // TODO - why are we using the next coordinates?
      const nextCoordinates = Coordinates.plus(
        unit.getCoordinates(),
        unit.getDirection()
      );
      await EquipmentScript.forName(equipment.script).onMove?.(
        equipment,
        nextCoordinates,
        state,
        session
      );
    }
  }

  const bonus = getBonus(map, coordinates);
  if (bonus) {
    await bonus.onUse(unit, state, session);
  }
};

const walk = async (
  unit: Unit,
  direction: Direction,
  session: Session,
  state: GameState
) => {
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  const map = unit.getMap();
  if (!map.contains(coordinates) || isBlocked(map, coordinates)) {
    // do nothing
  } else {
    await UnitApi.moveUnit(unit, coordinates, session, state);
    const playerUnit = session.getPlayerUnit();
    if (unit === playerUnit) {
      state.getSoundPlayer().playSound(Sounds.FOOTSTEP);
    }
    unit.recordStepTaken();
  }
};

const levelUp = async (unit: Unit, session: Session) => {
  const ticker = session.getTicker();
  unit.incrementLevel();
  if (unit.getFaction() === Faction.PLAYER) {
    const playerUnitClass = checkNotNull(unit.getPlayerUnitClass());
    unit.increaseMaxLife(playerUnitClass.lifePerLevel);
    unit.increaseMaxMana(playerUnitClass.manaPerLevel);
    unit.increaseStrength(playerUnitClass.strengthPerLevel);

    if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!  Press L to choose an ability.`, {
        turn: session.getTurn()
      });
      unit.awardAbilityPoint();
    } else if (Feature.isEnabled(Feature.SHRINES)) {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
    } else {
      ticker.log(`Welcome to level ${unit.getLevel()}!`, { turn: session.getTurn() });
      const abilitiesToLearn = playerUnitClass.getAbilitiesLearnedAtLevel(
        unit.getLevel()
      );
      for (const abilityName of abilitiesToLearn) {
        unit.learnAbility(UnitAbility.abilityForName(abilityName));
      }
    }
  }
};

const useItem = async (
  unit: Unit,
  item: InventoryItem,
  state: GameState,
  session: Session
) => {
  await item.use(unit, state, session);
  unit.getInventory().remove(item);
};

const beforeAttack = async (
  attacker: Unit,
  defender: Unit,
  state: GameState,
  session: Session
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).beforeAttack?.(
        equipment,
        defender.getCoordinates(),
        state,
        session
      );
    }
  }
};

const afterAttack = async (
  attacker: Unit,
  defender: Unit,
  state: GameState,
  session: Session
) => {
  for (const equipment of attacker.getEquipment().getAll()) {
    if (equipment.script) {
      await EquipmentScript.forName(equipment.script).afterAttack?.(
        equipment,
        defender.getCoordinates(),
        state,
        session
      );
    }
  }
};

const _canDropItems = (unit: Unit): boolean => {
  return !!unit.getExperienceRewarded();
};

const _createGlobe = async (
  coordinates: Coordinates,
  map: MapInstance,
  state: GameState
): Promise<GameObject> => {
  const objectFactory = state.getObjectFactory();
  return weightedRandom([
    {
      key: 'health_globe',
      value: () => objectFactory.createHealthGlobe(coordinates, map),
      weight: HEALTH_GLOBE_DROP_CHANCE
    },
    {
      key: 'mana_globe',
      value: () => objectFactory.createManaGlobe(coordinates, map),
      weight: MANA_GLOBE_DROP_CHANCE
    },
    {
      key: 'vision_globe',
      value: () => objectFactory.createVisionGlobe(coordinates, map),
      weight: VISION_GLOBE_DROP_CHANCE
    }
  ])();
};

export const UnitApi: UnitApiShape = {
  upkeep,
  die,
  endOfTurn,
  moveUnit,
  walk,
  dealDamage,
  levelUp,
  useItem,
  beforeAttack,
  afterAttack
};
