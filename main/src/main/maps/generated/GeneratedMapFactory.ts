import { Coordinates } from '@lib/geometry/Coordinates';
import { Direction } from '@lib/geometry/Direction';
import Grid from '@lib/geometry/Grid';
import MultiGrid from '@lib/geometry/MultiGrid';
import { checkNotNull } from '@lib/utils/preconditions';
import {
  randChance,
  randChoice,
  randFloat,
  randInt,
  weightedRandom,
  WeightedRandomChoice
} from '@lib/utils/random';
import ModelLoader from '@main/assets/ModelLoader';
import { Feature } from '@main/utils/features';
import { DoorDirection } from '@duzh/models';
import { Algorithm, GeneratedMapModel } from '@duzh/models';
import { TileType } from '@duzh/models';
import { UnitModel } from '@duzh/models';
import { MapTemplate, ObjectTemplate } from '../MapTemplate';
import { AbstractMapGenerator } from './AbstractMapGenerator';
import { BlobMapGenerator } from './BlobMapGenerator';
import { DefaultMapGenerator } from './DefaultMapGenerator';
import { getUnoccupiedLocations } from './MapGenerationUtils';
import { PathMapGenerator } from './PathMapGenerator';
import { RoomCorridorMapGenerator } from './room_corridor/RoomCorridorMapGenerator';
import { RoomCorridorMapGenerator2 } from './room_corridor_rewrite/RoomCorridorMapGenerator2';
import { ItemController } from '@main/items/ItemController';
import Tile from '@main/tiles/Tile';

type Props = Readonly<{
  modelLoader: ModelLoader;
  itemController: ItemController;
}>;

export class GeneratedMapFactory {
  private readonly modelLoader: ModelLoader;
  private readonly itemController: ItemController;

  constructor(props: Props) {
    this.modelLoader = props.modelLoader;
    this.itemController = props.itemController;
  }

  buildGeneratedMap = async (mapId: string): Promise<MapTemplate> => {
    const model = await this.modelLoader.loadGeneratedMapModel(mapId);
    const algorithm = model.algorithm;
    const tileSet =
      model.tileSet === 'RANDOM' ? randChoice(this._getTileSetNames()) : model.tileSet;
    const dungeonGenerator = this._getDungeonGenerator(algorithm);
    const template = await dungeonGenerator.generateMap(model);
    const units = await this._generateUnits(model, template);
    const objects = await this._generateObjects(model, template);
    return {
      ...template,
      tileSet,
      objects,
      units
    };
  };

  private _getDungeonGenerator = (algorithm: Algorithm): AbstractMapGenerator => {
    switch (algorithm) {
      case Algorithm.ROOMS_AND_CORRIDORS:
        return this._getRoomsAndCorridorsGenerator();
      case Algorithm.DEFAULT:
        return new DefaultMapGenerator({ fillRate: 0.25 });
      case Algorithm.BLOB:
        return new BlobMapGenerator({ fillRate: randFloat(0.3, 0.6) });
      case Algorithm.PATH:
        return new PathMapGenerator({ numPoints: 20 });
      case Algorithm.RANDOM:
        return this._getDungeonGenerator(
          randChoice([
            Algorithm.ROOMS_AND_CORRIDORS,
            Algorithm.DEFAULT,
            Algorithm.BLOB,
            Algorithm.PATH
          ])
        );
      default:
        throw new Error(`Unknown map layout ${algorithm}`);
    }
  };

  private _getRoomsAndCorridorsGenerator = (): AbstractMapGenerator => {
    if (Feature.isEnabled(Feature.ROOMS_AND_CORRIDORS_2)) {
      return new RoomCorridorMapGenerator2({
        minRoomWidth: 5,
        minRoomHeight: 4
      });
    }
    const minRoomDimension = 5;
    const maxRoomDimension = 9;
    return new RoomCorridorMapGenerator({
      minRoomDimension,
      maxRoomDimension
    });
  };

  private _generateUnits = async (
    model: GeneratedMapModel,
    map: MapTemplate
  ): Promise<Grid<UnitModel>> => {
    const { width, height } = model;
    const units = new Grid<UnitModel>({ width, height });
    const candidateLocations = getUnoccupiedLocations(
      map.tiles,
      [TileType.FLOOR],
      []
    ).filter(coordinates => !this._isOccupied(map, coordinates));
    let unitsRemaining = randInt(model.enemies.min, model.enemies.max);

    const enemyUnitModels = await this._getEnemyUnitModels(model);
    const choices: WeightedRandomChoice<UnitModel>[] = [];
    while (unitsRemaining > 0) {
      for (const [model, chance] of enemyUnitModels) {
        const key = model.id;
        choices.push({ key, weight: chance, value: model });
      }
      const unitModel = weightedRandom(choices);
      const coordinates = randChoice(candidateLocations);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      units.put(coordinates, unitModel);
      unitsRemaining--;
    }
    return units;
  };

  /** @return a list of [unit model, chance] */
  private _getEnemyUnitModels = async (
    model: GeneratedMapModel
  ): Promise<[UnitModel, number][]> => {
    return Promise.all(
      model.enemies.types.map(async ({ chance, type }) => {
        return [await this.modelLoader.loadUnitModel(type), chance];
      })
    );
  };

  private _generateObjects = async (
    model: GeneratedMapModel,
    map: MapTemplate
  ): Promise<MultiGrid<ObjectTemplate>> => {
    const { width, height } = map;
    const objects = new MultiGrid<ObjectTemplate>({ width, height });
    const candidateLocations = this._getCandidateObjectLocations(map);

    let itemsRemaining = randInt(model.items.min, model.items.max);

    while (itemsRemaining > 0) {
      const object = await this.itemController.chooseRandomMapItemForLevel(
        model.levelNumber
      );
      const coordinates = randChoice(candidateLocations);
      objects.put(coordinates, object);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      itemsRemaining--;
    }

    const doorChance = model.algorithm === Algorithm.ROOMS_AND_CORRIDORS ? 1 : 0;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = checkNotNull(map.tiles.get({ x, y }));
        if (tile === TileType.FLOOR_HALL) {
          const adjacentCoordinatesList = this._getDirectlyAdjacentCoordinates(
            { x, y },
            map
          );
          for (const adjacentCoordinates of adjacentCoordinatesList) {
            if (map.tiles.get(adjacentCoordinates) === TileType.FLOOR) {
              if (randChance(doorChance)) {
                const direction = Direction.between({ x, y }, adjacentCoordinates);
                const doorDirection =
                  direction === Direction.N || direction === Direction.S
                    ? DoorDirection.VERTICAL
                    : DoorDirection.HORIZONTAL;
                const door: ObjectTemplate = {
                  type: 'door',
                  direction: doorDirection,
                  locked: false
                };
                objects.put({ x, y }, door);
              }
            }
          }
        }
      }
    }

    if (Feature.isEnabled(Feature.SHRINES)) {
      const numShrines = model.shrines;
      for (let i = 0; i < numShrines; i++) {
        const coordinates = randChoice(candidateLocations);
        const shrine: ObjectTemplate = { type: 'shrine' };
        objects.put(coordinates, shrine);
        candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      }
    }

    return objects;
  };

  /**
   * Return a list of coordinates that are unblocked on all sides.
   * This is overkill, but it's to ensure that we never block the path
   * to the exit.
   */
  private _getCandidateObjectLocations = (map: MapTemplate): Coordinates[] => {
    return getUnoccupiedLocations(map.tiles, [TileType.FLOOR], [])
      .filter(coordinates => !this._isOccupied(map, coordinates))
      .filter(coordinates => {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const adjacentCoordinates = Coordinates.plus(coordinates, { dx, dy });
            if (!this._contains(map, adjacentCoordinates)) {
              return false;
            }
            const tile = checkNotNull(map.tiles.get(adjacentCoordinates));
            if (Tile.isBlocking(tile)) {
              return false;
            }
            if (this._isOccupied(map, adjacentCoordinates)) {
              return false;
            }
          }
        }
        return true;
      });
  };

  private _getDirectlyAdjacentCoordinates = (
    coordinates: Coordinates,
    map: MapTemplate
  ): Coordinates[] => {
    const adjacentCoordinatesList = [];
    for (const direction of Direction.values()) {
      const adjacentCoordinates = Coordinates.plusDirection(coordinates, direction);
      if (this._contains(map, adjacentCoordinates)) {
        adjacentCoordinatesList.push(adjacentCoordinates);
      }
    }
    return adjacentCoordinatesList;
  };

  /**
   * TODO hardcoding these
   */
  private _getTileSetNames = (): string[] => {
    if (Feature.isEnabled(Feature.DARK_DUNGEON)) {
      return ['dark/dungeon_dark1', 'dark/dungeon_dark2', 'dark/dungeon_dark3'];
    }

    return [
      'catacomb',
      'catacomb_gold',
      'catacomb_red',
      'cave',
      'cave_blue',
      'dungeon',
      'dungeon_brown',
      'dungeon_cga',
      'dungeon_cga_alt',
      'dungeon_green',
      'kroz',
      'kroz_teal',
      'kroz_green',
      'kroz_yellow',
      'zzt',
      'zzt_alt'
    ];
  };

  private _contains = (map: MapTemplate, coordinates: Coordinates): boolean => {
    const { x, y } = coordinates;
    return x >= 0 && x < map.width && y >= 0 && y < map.height;
  };

  private _isOccupied = (map: MapTemplate, coordinates: Coordinates): boolean => {
    return map.objects.get(coordinates).length > 0 || map.units.get(coordinates) !== null;
  };
}
