import AbstractMapGenerator from './AbstractMapGenerator';
import RoomCorridorMapGenerator from './room_corridor/RoomCorridorMapGenerator';
import RoomCorridorMapGenerator2 from './room_corridor_rewrite/RoomCorridorMapGenerator2';
import DefaultMapGenerator from './RoomCorridorMapGenerator3';
import BlobMapGenerator from './BlobMapGenerator';
import PathMapGenerator from './PathMapGenerator';
import { getUnoccupiedLocations } from './MapGenerationUtils';
import MapInstance from '../MapInstance';
import ItemFactory from '../../items/ItemFactory';
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
import { checkState } from '@lib/utils/preconditions';
import UnitFactory from '@main/units/UnitFactory';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Faction } from '@main/units/Faction';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import { isOccupied } from '@main/maps/MapUtils';
import { TileType } from '@models/TileType';
import MapItem from '@main/objects/MapItem';
import { inject, injectable } from 'inversify';

enum ItemType {
  EQUIPMENT = 'equipment',
  CONSUMABLE = 'consumable'
}

type ItemSpec = Readonly<{
  type: ItemType;
  id: string;
}>;

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

  private _getPossibleUnitModels = async (model: GeneratedMapModel) => {
    const allUnitModels = await this.modelLoader.loadAllUnitModels();
    const possibleUnitModels = allUnitModels.filter(unitModel => {
      const { levelParameters } = unitModel;
      if (levelParameters) {
        return (
          levelParameters.minLevel <= model.levelNumber &&
          levelParameters.maxLevel >= model.levelNumber
        );
      }
      return false;
    });

    if (possibleUnitModels.length === 0) {
      throw new Error('no matching unit models');
    }
    return possibleUnitModels;
  };

  private _generateObjects = async (
    map: MapInstance,
    mapModel: GeneratedMapModel
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(
      map.getTiles(),
      [TileType.FLOOR],
      []
    ).filter(coordinates => !isOccupied(map, coordinates));

    const allEquipmentModels = await this.modelLoader.loadAllEquipmentModels();
    const allConsumableModels = await this.modelLoader.loadAllConsumableModels();
    let itemsRemaining = randInt(mapModel.items.min, mapModel.items.max);

    const itemSpecs: ItemSpec[] = [];
    while (itemsRemaining > 0) {
      // TODO: this is a hack to force a bronze sword on the first level
      // I don't want to design a better DSL for map generation right now
      if (Feature.isEnabled(Feature.FORCE_BRONZE_SWORD)) {
        if (
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
        }
      }
      const possibleEquipmentModels = allEquipmentModels
        .filter(equipmentModel => {
          if (Feature.isEnabled(Feature.DEDUPLICATE_EQUIPMENT)) {
            return !this.state.getGeneratedEquipmentIds().includes(equipmentModel.id);
          }
          return true;
        })
        .filter(
          equipmentModel =>
            equipmentModel.level && equipmentModel.level <= mapModel.levelNumber
        );

      const possibleItemModels = allConsumableModels.filter(
        itemModel => itemModel.level && itemModel.level <= mapModel.levelNumber
      );

      const possibleItemSpecs: ItemSpec[] = [
        ...possibleEquipmentModels.map(model => ({
          type: ItemType.EQUIPMENT,
          id: model.id
        })),
        ...possibleItemModels.map(model => ({
          type: ItemType.CONSUMABLE,
          id: model.id
        }))
      ];

      checkState(possibleItemSpecs.length > 0);

      // weighted random
      const choices: WeightedRandomChoice<ItemSpec>[] = [];

      for (const itemSpec of possibleItemSpecs) {
        const key = `${itemSpec.type}_${itemSpec.id}`;
        const model = (() => {
          switch (itemSpec.type) {
            case ItemType.EQUIPMENT:
              return possibleEquipmentModels.find(
                equipmentModel => equipmentModel.id === itemSpec.id
              );
            case ItemType.CONSUMABLE:
              return possibleItemModels.find(itemClass => itemClass.id === itemSpec.id);
          }
        })();

        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        const weight = 0.5 ** (model?.rarity ?? 0);
        choices.push({ weight, key, value: itemSpec });
      }
      const chosenItemSpec = weightedRandom(choices);
      itemSpecs.push(chosenItemSpec);
      if (chosenItemSpec.type === ItemType.EQUIPMENT) {
        this.state.recordEquipmentGenerated(chosenItemSpec.id);
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

    return objects;
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
