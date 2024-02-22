import AbstractMapGenerator from './AbstractMapGenerator';
import RoomCorridorMapGenerator from './room_corridor/RoomCorridorMapGenerator';
import RoomCorridorMapGenerator2 from './room_corridor_rewrite/RoomCorridorMapGenerator2';
import RoomCorridorMapGenerator3 from './RoomCorridorMapGenerator3';
import BlobMapGenerator from './BlobMapGenerator';
import PathMapGenerator from './PathMapGenerator';
import ModelLoader from '../../utils/ModelLoader';
import MapInstance from '../MapInstance';
import { randChoice } from '../../utils/random';
import ItemFactory from '../../items/ItemFactory';
import TileFactory from '../../tiles/TileFactory';
import GameObject from '../../entities/objects/GameObject';
import Unit from '../../entities/units/Unit';
import { getUnoccupiedLocations } from '../MapUtils';
import UnitModel from '../../schemas/UnitModel';
import ArcherController from '../../entities/units/controllers/ArcherController';
import BasicEnemyController from '../../entities/units/controllers/BasicEnemyController';
import GeneratedMapModel from '../../schemas/GeneratedMapModel';
import UnitFactory from '../../entities/units/UnitFactory';
import Coordinates from '../../geometry/Coordinates';
import MapItem from '../../entities/objects/MapItem';
import { Faction } from '../../entities/units/Faction';
import ObjectFactory from '../../entities/objects/ObjectFactory';
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

type ItemType = 'equipment' | 'consumable';
type ItemSpec = Readonly<{
  type: ItemType;
  id: string;
}>;

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
    @inject(ObjectFactory)
    private readonly objectFactory: ObjectFactory
  ) {}

  loadMap = async (model: GeneratedMapModel): Promise<MapInstance> => {
    const style = this._chooseMapStyle();
    const dungeonGenerator = this._getDungeonGenerator(style.layout);
    const map = await dungeonGenerator.generateMap(model, style.tileSet);
    const units = await this._generateUnits(map, model);
    for (const unit of units) {
      map.addUnit(unit);
    }
    const objects: GameObject[] = await this._generateObjects(map, model);
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
        //'ROOMS_AND_CORRIDORS',
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
    ).filter(coordinates => !this._isOccupied(coordinates, map));
    for (const { id: unitClass, count } of model.enemies) {
      const unitModel = await this.modelLoader.loadUnitModel(unitClass);
      for (let i = 0; i < count; i++) {
        const coordinates = randChoice(candidateLocations);
        candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
        const controller = this._chooseUnitController(unitModel);
        const unit = await unitFactory.createUnit({
          unitClass,
          controller,
          faction: Faction.ENEMY,
          coordinates,
          level: model.levelNumber,
          map
        });
        units.push(unit);
      }
    }
    return units;
  };

  private _chooseUnitController = (unitModel: UnitModel) => {
    if (unitModel.name === 'Goblin Archer') {
      return new ArcherController();
    } else {
      return new BasicEnemyController();
    }
  };

  private _generateObjects = async (
    map: MapInstance,
    mapModel: GeneratedMapModel
  ): Promise<GameObject[]> => {
    const objects: GameObject[] = [];
    const candidateLocations = getUnoccupiedLocations(
      map.getTiles(),
      ['FLOOR'],
      []
    ).filter(coordinates => !this._isOccupied(coordinates, map));

    for (const { id: itemId, count } of mapModel.items ?? []) {
      for (let i = 0; i < count; i++) {
        const coordinates = randChoice(candidateLocations);
        candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
        const item = await this.itemFactory.createMapItem(itemId, coordinates, map);
        objects.push(item);
      }
    }

    for (const { id: equipmentId, count } of mapModel.equipment ?? []) {
      for (let i = 0; i < count; i++) {
        const coordinates = randChoice(candidateLocations);
        candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
        const item = await this.itemFactory.createMapEquipment(
          equipmentId,
          coordinates,
          map
        );
        objects.push(item);
      }
    }

    for (const { id: objectId, count } of mapModel.objects ?? []) {
      for (let i = 0; i < count; i++) {
        const coordinates = randChoice(candidateLocations);
        candidateLocations.splice(candidateLocations.indexOf(coordinates), 1);
        const object = await this.objectFactory.createObject(objectId, coordinates, map);
        objects.push(object);
      }
    }
    return objects;
  };

  private _isOccupied = (coordinates: Coordinates, map: MapInstance) => {
    return map.getObjects(coordinates).length > 0 || map.getUnit(coordinates) !== null;
  };

  private _generateMapItem = async (
    itemSpec: ItemSpec,
    coordinates: Coordinates,
    map: MapInstance
  ): Promise<MapItem> => {
    switch (itemSpec.type) {
      case 'equipment': {
        return this.itemFactory.createMapEquipment(itemSpec.id, coordinates, map);
      }
      case 'consumable': {
        return this.itemFactory.createMapItem(itemSpec.id, coordinates, map);
      }
    }
  };
}
