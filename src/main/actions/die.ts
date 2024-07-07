import { gameOver } from './gameOver';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { random, weightedRandom } from '@lib/utils/random';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { UnitType } from '@models/UnitType';
import { Coordinates } from '@lib/geometry/Coordinates';
import MapInstance from '@main/maps/MapInstance';
import GameObject from '@main/objects/GameObject';
import { ItemType } from '@main/items/ItemFactory';

// TODO this should be enemy-specific? add loot tables
const ITEM_DROP_CHANCE = 0.1;
const GLOBE_DROP_CHANCE = 0.2;
const HEALTH_GLOBE_DROP_CHANCE = 1;
const MANA_GLOBE_DROP_CHANCE = 0;
const VISION_GLOBE_DROP_CHANCE = 0;

export const die = async (unit: Unit, state: GameState, session: Session) => {
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
          const item = await _createItem(coordinates, map, state);
          map.addObject(item);
          session.getTicker().log(`${unit.getName()} dropped a ${item.getName()}.`, {
            turn: session.getTurn()
          });
        }
      }
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

const _createItem = async (
  coordinates: Coordinates,
  map: MapInstance,
  state: GameState
): Promise<GameObject> => {
  const itemFactory = state.getItemFactory();
  const itemSpec = await itemFactory.chooseRandomMapItemForLevel(map.levelNumber, state);
  state.recordEquipmentGenerated(itemSpec.id);
  switch (itemSpec.type) {
    case ItemType.CONSUMABLE:
      return itemFactory.createMapItem(itemSpec.id, coordinates, map);
    case ItemType.EQUIPMENT:
      return itemFactory.createMapEquipment(itemSpec.id, coordinates, map);
  }
};
