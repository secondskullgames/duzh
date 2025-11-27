import { Coordinates } from '@duzh/geometry';
import { random, weightedRandom } from '@duzh/utils/random';
import { Game } from '@main/core/Game';
import MapInstance from '@main/maps/MapInstance';
import GameObject from '@main/objects/GameObject';
import Unit from '@main/units/Unit';
import { gameOver } from './gameOver';

// TODO this should be enemy-specific? add loot tables
const ITEM_DROP_CHANCE = 0.1;
const GLOBE_DROP_CHANCE = 0.25;
const HEALTH_GLOBE_DROP_CHANCE = 0.9;
const MANA_GLOBE_DROP_CHANCE = 0;
const VISION_GLOBE_DROP_CHANCE = 0.1;

export const die = async (unit: Unit, game: Game) => {
  const { soundController, state, ticker } = game;
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
    soundController.playSound('enemy_dies');
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
  const { itemFactory, mapObjectFactory } = game;
  const objectTemplate = await mapObjectFactory.chooseRandomMapItemForLevel(
    map.levelNumber
  );
  switch (objectTemplate.type) {
    case 'item':
      return itemFactory.createMapItem(objectTemplate.model.id, coordinates, map);
    case 'equipment':
      return itemFactory.createMapEquipment(objectTemplate.model.id, coordinates, map);
  }
};
