import { gameOver } from './gameOver';
import Unit from '@main/units/Unit';
import Sounds from '@main/sounds/Sounds';
import { random, weightedRandom } from '@lib/utils/random';
import { Coordinates } from '@lib/geometry/Coordinates';
import MapInstance from '@main/maps/MapInstance';
import GameObject from '@main/objects/GameObject';
import { ItemType } from '@main/items/ItemFactory';
import { Game } from '@main/core/Game';

// TODO this should be enemy-specific? add loot tables
const ITEM_DROP_CHANCE = 0.05;
const GLOBE_DROP_CHANCE = 0.2;
const HEALTH_GLOBE_DROP_CHANCE = 1;
const MANA_GLOBE_DROP_CHANCE = 0;
const VISION_GLOBE_DROP_CHANCE = 0;

export const die = async (unit: Unit, game: Game) => {
  const { soundPlayer, state, ticker } = game;
  const playerUnit = state.getPlayerUnit();
  const coordinates = unit.getCoordinates();
  const map = unit.getMap();

  map.removeUnit(unit);
  state.removeUnit(unit);
  if (unit === playerUnit) {
    await gameOver(game);
    state.setGameOverState({ levelNumber: map.levelNumber });
    return;
  } else {
    soundPlayer.playSound(Sounds.ENEMY_DIES);
    ticker.log(`${unit.getName()} dies!`, { turn: state.getTurn() });

    if (_canDropItems(unit)) {
      const randomRoll = random();
      if (randomRoll < GLOBE_DROP_CHANCE) {
        const globe = await _createGlobe(coordinates, map, game);
        map.addObject(globe);
      } else if (randomRoll < GLOBE_DROP_CHANCE + ITEM_DROP_CHANCE) {
        const item = await _createItem(coordinates, map, game);
        map.addObject(item);
        ticker.log(`${unit.getName()} dropped a ${item.getName()}.`, {
          turn: state.getTurn()
        });
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
  game: Game
): Promise<GameObject> => {
  const { objectFactory } = game;
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
  game: Game
): Promise<GameObject> => {
  const { state, itemFactory } = game;
  const itemSpec = await itemFactory.chooseRandomMapItemForLevel(map.levelNumber, game);
  state.recordEquipmentGenerated(itemSpec.id);
  switch (itemSpec.type) {
    case ItemType.CONSUMABLE:
      return itemFactory.createMapItem(itemSpec.id, coordinates, map);
    case ItemType.EQUIPMENT:
      return itemFactory.createMapEquipment(itemSpec.id, coordinates, map);
  }
};
