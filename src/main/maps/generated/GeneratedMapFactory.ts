import AbstractMapGenerator from './AbstractMapGenerator';
import RoomCorridorMapGenerator from './room_corridor/RoomCorridorMapGenerator';
import RoomCorridorMapGenerator2 from './room_corridor_rewrite/RoomCorridorMapGenerator2';
import RoomCorridorMapGenerator3 from './RoomCorridorMapGenerator3';
import BlobMapGenerator from './BlobMapGenerator';
import PathMapGenerator from './PathMapGenerator';
import { getUnoccupiedLocations } from './MapGenerationUtils';
import ModelLoader from '../../utils/ModelLoader';
import MapInstance from '../MapInstance';
import { GameState } from '../../core/GameState';
import { randChoice, randInt, weightedRandom } from '../../utils/random';
import ItemFactory from '../../items/ItemFactory';
import TileFactory from '../../tiles/TileFactory';
import GameObject from '../../entities/objects/GameObject';
import Unit from '../../entities/units/Unit';
import UnitModel from '../../schemas/UnitModel';
import { Feature } from '../../utils/features';
import { checkState } from '../../utils/preconditions';
import GeneratedMapModel from '../../schemas/GeneratedMapModel';
import UnitFactory from '../../entities/units/UnitFactory';
import { Faction } from '../../entities/units/Faction';
import { chooseUnitController } from '../../entities/units/controllers/ControllerUtils';
import ConsumableItemModel from '../../schemas/ConsumableItemModel';
import EquipmentModel from '../../schemas/EquipmentModel';
import { isOccupied } from '../MapUtils';
import { inject, injectable } from 'inversify';

type MapStyle = Readonly<{
  tileSet: string;
  layout: string;
}>;

namespace MapStyle {
  export const equals = (first: MapStyle, second: MapStyle) => {
    return first.tileSet === second.tileSet && first.layout === second.layout;
  };
}

@injectable()
export class GeneratedMapFactory {
  private readonly usedMapStyles: MapStyle[] = [];

  constructor(
    @inject(ModelLoader)
    private readonly modelLoader: ModelLoader,
    @inject(TileFactory)
    private readonly tileFactory: TileFactory,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory,
    @inject(UnitFactory)
    private readonly unitFactory: UnitFactory,
    @inject(GameState.SYMBOL)
    private readonly state: GameState
  ) {}

  loadMap = async (mapId: string): Promise<MapInstance> => {
    const model = await this.modelLoader.loadGeneratedMapModel(mapId);
    const style = this._chooseMapStyle();
    const dungeonGenerator = this._getDungeonGenerator(style.layout);
    console.debug(`Generating map: ${JSON.stringify(style)}`);
    const map = await dungeonGenerator.generateMap(model, style.tileSet);
    const units = await this._generateUnits(map, model);
    for (const unit of units) {
      map.addUnit(unit);
    }
    const objects: GameObject[] = await this._generateItems(map, model);
    for (const object of objects) {
      map.addObject(object);
    }
    return map;
  };

  private _getDungeonGenerator = (mapLayout: string): AbstractMapGenerator => {
    const { tileFactory } = this;
    switch (mapLayout) {
      case 'ROOMS_AND_CORRIDORS': {
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
      }
      case 'ROOMS_AND_CORRIDORS_3':
        return new RoomCorridorMapGenerator3(tileFactory);
      case 'BLOB':
        return new BlobMapGenerator(tileFactory);
      case 'PATH':
        return new PathMapGenerator(tileFactory);
      default:
        throw new Error(`Unknown map layout ${mapLayout}`);
    }
  };

  private _chooseMapStyle = (): MapStyle => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const layout = randChoice([
        'ROOMS_AND_CORRIDORS',
        'ROOMS_AND_CORRIDORS_3',
        'PATH',
        'BLOB'
      ]);
      const tileSet = randChoice(this.tileFactory.getTileSetNames());
      const chosenStyle = { layout, tileSet };
      if (!this.usedMapStyles.some(style => MapStyle.equals(style, chosenStyle))) {
        this.usedMapStyles.push(chosenStyle);
        return chosenStyle;
      }
    }
  };

  private _generateUnits = async (
    map: MapInstance,
    model: GeneratedMapModel
  ): Promise<Unit[]> => {
    const { unitFactory } = this;

    const units: Unit[] = [];
    const candidateLocations = getUnoccupiedLocations(
      map.getTiles(),
      ['FLOOR'],
      []
    ).filter(coordinates => !isOccupied(map, coordinates));
    let unitsRemaining = randInt(model.enemies.min, model.enemies.max);

    const possibleUnitModels = await this._getPossibleUnitModels(model);
    while (unitsRemaining > 0) {
      // weighted random, favoring higher-level units
      const probabilities: Record<string, number> = {};
      const mappedUnitModels: Record<string, UnitModel> = {};
      for (const model of possibleUnitModels) {
        const key = model.id;
        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        probabilities[key] = 1 / 2 ** (model?.levelParameters!.rarity ?? 0);
        mappedUnitModels[key] = model;
      }
      const unitModel = weightedRandom(probabilities, mappedUnitModels);
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

  private _generateItems = async (
    map: MapInstance,
    mapModel: GeneratedMapModel
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(
      map.getTiles(),
      ['FLOOR'],
      []
    ).filter(coordinates => !isOccupied(map, coordinates));

    const allConsumableModels = await this.modelLoader.loadAllConsumableModels();
    let itemsRemaining = randInt(mapModel.items.min, mapModel.items.max);

    const consumableItemModels: ConsumableItemModel[] = [];
    while (itemsRemaining > 0) {
      const possibleItemModels = allConsumableModels.filter(
        model => model.level !== null && model.level <= mapModel.levelNumber
      );

      checkState(possibleItemModels.length > 0);

      // weighted random
      const probabilities: Record<string, number> = {};
      const mappedObjects: Record<string, ConsumableItemModel> = {};

      for (const model of possibleItemModels) {
        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        probabilities[model.id] = 1 / 2 ** (model?.rarity ?? 0);
        mappedObjects[model.id] = model;
      }
      const chosenItemSpec = weightedRandom(probabilities, mappedObjects);
      consumableItemModels.push(chosenItemSpec);
      itemsRemaining--;
    }

    for (const model of consumableItemModels) {
      const coordinates = randChoice(candidateLocations);
      const item = await this.itemFactory.createMapItem(model.id, coordinates, map);
      objects.push(item);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      itemsRemaining--;
    }

    return objects;
  };

  private _generateEquipment = async (
    map: MapInstance,
    mapModel: GeneratedMapModel
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(
      map.getTiles(),
      ['FLOOR'],
      []
    ).filter(coordinates => !isOccupied(map, coordinates));

    const allEquipmentModels = await this.modelLoader.loadAllEquipmentModels();
    let itemsRemaining = randInt(mapModel.items.min, mapModel.items.max);

    const equipmentModels: EquipmentModel[] = [];
    while (itemsRemaining > 0) {
      const possibleEquipmentModels = allEquipmentModels
        .filter(equipmentModel => {
          if (Feature.isEnabled(Feature.DEDUPLICATE_EQUIPMENT)) {
            return !this.state.getGeneratedEquipmentIds().includes(equipmentModel.id);
          }
          return true;
        })
        .filter(
          equipmentModel =>
            equipmentModel.level !== null && equipmentModel.level <= mapModel.levelNumber
        );

      checkState(possibleEquipmentModels.length > 0);

      // weighted random
      const probabilities: Record<string, number> = {};
      const mappedObjects: Record<string, EquipmentModel> = {};

      for (const model of possibleEquipmentModels) {
        // Each rarity is 2x less common than the previous rarity.
        // So P[rarity] = 2 ^ -rarity
        probabilities[model.id] = 1 / 2 ** (model?.rarity ?? 0);
        mappedObjects[model.id] = model;
      }
      const chosenModel = weightedRandom(probabilities, mappedObjects);
      equipmentModels.push(chosenModel);
      this.state.recordEquipmentGenerated(chosenModel.id);
      itemsRemaining--;
    }

    for (const model of equipmentModels) {
      const coordinates = randChoice(candidateLocations);
      const item = await this.itemFactory.createMapEquipment(model.id, coordinates, map);
      objects.push(item);
      candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
      itemsRemaining--;
    }

    return objects;
  };
}
