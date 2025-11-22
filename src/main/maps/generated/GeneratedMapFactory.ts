import { Coordinates } from '@lib/geometry/Coordinates';
import { Direction } from '@lib/geometry/Direction';
import Grid from '@lib/geometry/Grid';
import MultiGrid from '@lib/geometry/MultiGrid';
import { checkNotNull, checkState } from '@lib/utils/preconditions';
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
import { DoorDirection } from '@models/DoorDirection';
import { Algorithm, GeneratedMapModel } from '@models/GeneratedMapModel';
import { TileType } from '@models/TileType';
import { UnitModel } from '@models/UnitModel';
import {
  MapTemplate,
  ObjectOrEquipment as ItemOrEquipment,
  ObjectTemplate
} from '../MapTemplate';
import { AbstractMapGenerator } from './AbstractMapGenerator';
import { BlobMapGenerator } from './BlobMapGenerator';
import { DefaultMapGenerator } from './DefaultMapGenerator';
import { getUnoccupiedLocations } from './MapGenerationUtils';
import { PathMapGenerator } from './PathMapGenerator';
import { RoomCorridorMapGenerator } from './room_corridor/RoomCorridorMapGenerator';
import { RoomCorridorMapGenerator2 } from './room_corridor_rewrite/RoomCorridorMapGenerator2';

export class GeneratedMapFactory {
  private readonly generatedEquipmentIds = new Set<string>();

  constructor(private readonly modelLoader: ModelLoader) {}

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
      let object: ItemOrEquipment;
      // TODO: this is a hack to force a bronze sword on the first level
      // I don't want to design a better DSL for map generation right now
      if (
        Feature.isEnabled(Feature.FORCE_BRONZE_SWORD) &&
        model.levelNumber === 1 &&
        !this.generatedEquipmentIds.has('bronze_sword')
      ) {
        const equipmentModel = await this.modelLoader.loadEquipmentModel('bronze_sword');
        object = { type: 'equipment', model: equipmentModel };
      } else {
        object = await this._chooseRandomMapItemForLevel(model.levelNumber);
      }

      const coordinates = randChoice(candidateLocations);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      if (object.type === 'equipment') {
        this.generatedEquipmentIds.add(object.model.id);
      }
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
            if (TileType.isBlocking(tile)) {
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

  private _chooseRandomMapItemForLevel = async (
    levelNumber: number
  ): Promise<ItemOrEquipment> => {
    const allEquipmentModels = await this.modelLoader.loadAllEquipmentModels();
    const allConsumableModels = await this.modelLoader.loadAllConsumableModels();
    const possibleEquipmentModels = allEquipmentModels
      .filter(equipmentModel => {
        if (Feature.isEnabled(Feature.DEDUPLICATE_EQUIPMENT)) {
          return this.generatedEquipmentIds.has(equipmentModel.id);
        }
        return true;
      })
      .filter(
        equipmentModel => equipmentModel.level && equipmentModel.level <= levelNumber
      );

    const possibleItemModels = allConsumableModels.filter(
      itemModel => itemModel.level && itemModel.level <= levelNumber
    );

    const possibleObjects: ItemOrEquipment[] = [
      ...possibleEquipmentModels.map(model => ({
        type: 'equipment' as const,
        model
      })),
      ...possibleItemModels.map(model => ({
        type: 'item' as const,
        model
      }))
    ];

    checkState(possibleObjects.length > 0);

    // weighted random
    const choices: WeightedRandomChoice<ItemOrEquipment>[] = [];

    for (let i = 0; i < possibleObjects.length; i++) {
      const object = possibleObjects[i];
      const key = `${i}`;
      const { model } = object;
      // Each rarity is 2x less common than the previous rarity.
      // So P[rarity] = 2 ^ -rarity
      const weight = 0.5 ** (model?.rarity ?? 0);
      choices.push({ weight, key, value: object });
    }
    return weightedRandom(choices);
  };
}
