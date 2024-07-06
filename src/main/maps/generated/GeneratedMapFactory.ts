import AbstractMapGenerator from './AbstractMapGenerator';
import RoomCorridorMapGenerator from './room_corridor/RoomCorridorMapGenerator';
import RoomCorridorMapGenerator2 from './room_corridor_rewrite/RoomCorridorMapGenerator2';
import DefaultMapGenerator from './RoomCorridorMapGenerator3';
import BlobMapGenerator from './BlobMapGenerator';
import PathMapGenerator from './PathMapGenerator';
import { getUnoccupiedLocations } from './MapGenerationUtils';
import MapInstance from '../MapInstance';
import ItemFactory, { ItemSpec, ItemType } from '../../items/ItemFactory';
import TileFactory from '../../tiles/TileFactory';
import GameObject from '../../objects/GameObject';
import { UnitModel } from '@models/UnitModel';
import { GeneratedMapModel, Algorithm } from '@models/GeneratedMapModel';
import ModelLoader from '@main/assets/ModelLoader';
import {
  randChoice,
  randInt,
  weightedRandom,
  WeightedRandomChoice
} from '@lib/utils/random';
import { GameState } from '@main/core/GameState';
import Unit from '@main/units/Unit';
import { Feature } from '@main/utils/features';
import UnitFactory from '@main/units/UnitFactory';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Faction } from '@main/units/Faction';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import { isOccupied } from '@main/maps/MapUtils';
import { TileType } from '@models/TileType';
import MapItem from '@main/objects/MapItem';
import ObjectFactory from '@main/objects/ObjectFactory';
import { inject, injectable } from 'inversify';

const algorithms: Algorithm[] = [
  Algorithm.ROOMS_AND_CORRIDORS,
  Algorithm.DEFAULT,
  Algorithm.PATH,
  Algorithm.BLOB
];

@injectable()
export class GeneratedMapFactory {
  constructor(
    @inject(ModelLoader)
    private readonly modelLoader: ModelLoader,
    @inject(TileFactory)
    private readonly tileFactory: TileFactory,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(ObjectFactory)
    private readonly objectFactory: ObjectFactory,
    @inject(GameState)
    private readonly state: GameState
  ) {}

  loadMap = async (mapId: string): Promise<MapInstance> => {
    const model = await this.modelLoader.loadGeneratedMapModel(mapId);
    const algorithm: Algorithm = model.algorithm ?? randChoice(algorithms);
    const tileSet = model.tileSet ?? randChoice(this.tileFactory.getTileSetNames());
    const dungeonGenerator = this._getDungeonGenerator(algorithm);
    const map = await dungeonGenerator.generateMap(model, tileSet);
    const units = await this._generateUnits(map, model);
    for (const unit of units) {
      map.addUnit(unit);
    }
    const objects = await this._generateObjects(map, model);
    for (const object of objects) {
      map.addObject(object);
    }
    return map;
  };

  private _getDungeonGenerator = (mapLayout: Algorithm): AbstractMapGenerator => {
    const { tileFactory } = this;
    switch (mapLayout) {
      case Algorithm.ROOMS_AND_CORRIDORS:
        return this._getRoomsAndCorridorsGenerator(tileFactory);
      case Algorithm.DEFAULT:
        return new DefaultMapGenerator(tileFactory);
      case Algorithm.BLOB:
        return new BlobMapGenerator(tileFactory);
      case Algorithm.PATH:
        return new PathMapGenerator(tileFactory);
      default:
        throw new Error(`Unknown map layout ${mapLayout}`);
    }
  };

  private _getRoomsAndCorridorsGenerator = (tileFactory: TileFactory) => {
    const useNewMapGenerator = true;
    if (useNewMapGenerator) {
      return new RoomCorridorMapGenerator2(tileFactory);
    }
    const minRoomDimension = 3;
    const maxRoomDimension = 7;
    return new RoomCorridorMapGenerator({
      minRoomDimension,
      maxRoomDimension,
      tileFactory
    });
  };

  private _generateUnits = async (
    map: MapInstance,
    model: GeneratedMapModel
  ): Promise<Unit[]> => {
    const { unitFactory } = this;

    const units: Unit[] = [];
    const candidateLocations = getUnoccupiedLocations(
      map.getTiles(),
      [TileType.FLOOR],
      []
    ).filter(coordinates => !isOccupied(map, coordinates));
    let unitsRemaining = randInt(model.enemies.min, model.enemies.max);

    const possibleUnitModels = await this._getPossibleUnitModels(model);
    const choices: WeightedRandomChoice<UnitModel>[] = [];
    while (unitsRemaining > 0) {
      // weighted random, favoring higher-level units
      for (const model of possibleUnitModels) {
        const key = model.id;
        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        const rarity = model?.levelParameters!.rarity ?? 0;
        const weight = 0.5 ** rarity;
        choices.push({ key, weight, value: model });
      }
      const unitModel = weightedRandom(choices);
      const coordinates = randChoice(candidateLocations);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      const controller = chooseUnitController(unitModel.id);
      const unit = await unitFactory.createUnit({
        unitClass: unitModel.id,
        controller,
        faction: Faction.ENEMY,
        coordinates,
        level: model.levelNumber,
        map
      });
      units.push(unit);
      unitsRemaining--;
    }
    return units;
  };

  private _getPossibleUnitModels = async (
    model: GeneratedMapModel
  ): Promise<UnitModel[]> => {
    return Promise.all(model.enemies.types.map(this.modelLoader.loadUnitModel));
  };

  private _generateObjects = async (
    map: MapInstance,
    mapModel: GeneratedMapModel
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = this._getCandidateObjectLocations(map);

    let itemsRemaining = randInt(mapModel.items.min, mapModel.items.max);

    const itemSpecs: ItemSpec[] = [];
    while (itemsRemaining > 0) {
      // TODO: this is a hack to force a bronze sword on the first level
      // I don't want to design a better DSL for map generation right now
      if (
        Feature.isEnabled(Feature.FORCE_BRONZE_SWORD) &&
        mapModel.levelNumber === 1 &&
        !this.state.getGeneratedEquipmentIds().includes('bronze_sword')
      ) {
        itemSpecs.push({
          type: ItemType.EQUIPMENT,
          id: 'bronze_sword'
        });
        itemsRemaining--;
        this.state.recordEquipmentGenerated('bronze_sword');
        continue;
      } else {
        const chosenItemSpec = await this.itemFactory.chooseRandomMapItemForLevel(
          mapModel.levelNumber,
          this.state
        );
        itemSpecs.push(chosenItemSpec);
        if (chosenItemSpec.type === ItemType.EQUIPMENT) {
          this.state.recordEquipmentGenerated(chosenItemSpec.id);
        }
      }
      itemsRemaining--;
    }

    for (const itemSpec of itemSpecs) {
      const coordinates = randChoice(candidateLocations);
      const item = await this._generateMapItem(itemSpec, coordinates, map);
      objects.push(item);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      itemsRemaining--;
    }

    if (Feature.isEnabled(Feature.SHRINES)) {
      // TODO this should be part of the model
      const numShrines = map.levelNumber % 2 === 0 ? 1 : 0;
      for (let i = 0; i < numShrines; i++) {
        const coordinates = randChoice(candidateLocations);
        const shrine = await this.objectFactory.createShrine(coordinates, map);
        objects.push(shrine);
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
  private _getCandidateObjectLocations = (map: MapInstance): Coordinates[] => {
    return getUnoccupiedLocations(map.getTiles(), [TileType.FLOOR], [])
      .filter(coordinates => !isOccupied(map, coordinates))
      .filter(coordinates => {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const adjacentCoordinates = Coordinates.plus(coordinates, { dx, dy });
            if (!map.contains(adjacentCoordinates)) {
              return false;
            }
            const tile = map.getTile(adjacentCoordinates);
            if (tile.isBlocking()) {
              return false;
            }
            if (isOccupied(map, adjacentCoordinates)) {
              return false;
            }
          }
        }
        return true;
      });
  };

  private _generateMapItem = async (
    itemSpec: ItemSpec,
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<MapItem> => {
    switch (itemSpec.type) {
      case ItemType.EQUIPMENT:
        return this.itemFactory.createMapEquipment(itemSpec.id, coordinates, map);
      case ItemType.CONSUMABLE:
        return this.itemFactory.createMapItem(itemSpec.id, coordinates, map);
    }
  };
}
