import Tile from '../../tiles/Tile';
import Unit from '../../units/Unit';
import GameObject from '../../objects/GameObject';
import MapInstance from '../MapInstance';
import Colors from '@main/graphics/Colors';
import { PredefinedMapModel } from '@models/PredefinedMapModel';
import { TileType } from '@models/TileType';
import { Coordinates } from '@lib/geometry/Coordinates';
import { Faction } from '@main/units/Faction';
import { chooseUnitController } from '@main/units/controllers/ControllerUtils';
import { Image } from '@lib/graphics/images/Image';
import { Color } from '@lib/graphics/Color';
import { DoorDirection } from '@models/DoorDirection';
import { Globals } from '@main/core/globals';

export class PredefinedMapFactory {
  constructor() {}

  buildPredefinedMap = async (mapId: string): Promise<MapInstance> => {
    const { imageFactory, modelLoader, musicController } = Globals;
    const model = await modelLoader.loadPredefinedMapModel(mapId);
    const image = await imageFactory.getImage({
      filename: `maps/${model.imageFilename}`
    });

    const startingCoordinates = await this._loadStartingCoordinates(image, model);
    const map = new MapInstance({
      id: model.id,
      width: image.bitmap.width,
      height: image.bitmap.height,
      levelNumber: model.levelNumber,
      startingCoordinates,
      music: model.music ? await musicController.loadMusic(model.music) : null,
      fogParams: model.fogOfWar
    });

    const tiles = await this._loadTiles(model, image, map);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.addTile(tiles[y][x]);
      }
    }

    const units = await this._loadUnits(model, image, map);
    for (const unit of units) {
      map.addUnit(unit);
    }

    const objects = await this._loadObjects(model, image, map);
    for (const object of objects) {
      map.addObject(object);
    }
    return map;
  };

  private _loadTiles = async (
    model: PredefinedMapModel,
    image: Image,
    map: MapInstance
  ): Promise<Tile[][]> => {
    const { tileFactory } = Globals;
    const tileColors = this._toHexColors(model.tileColors);
    const tileSet = await tileFactory.getTileSet(model.tileset);
    const tiles: Tile[][] = [];
    for (let y = 0; y < image.height; y++) {
      tiles.push([]);
      for (let x = 0; x < image.width; x++) {
        const { r, g, b } = image.getRGB({ x, y });
        const color = Color.fromRGB({ r, g, b });

        const tileType = tileColors[color.hex] ?? model.defaultTile ?? null;
        if (tileType !== null) {
          tiles[y][x] = tileFactory.createTile(
            {
              tileType: tileType as TileType,
              tileSet
            },
            { x, y },
            map
          );
        } else {
          throw new Error(
            `unrecognized color ${color.hex} at ${JSON.stringify({ x, y })}`
          );
        }
      }
    }

    return tiles;
  };

  private _loadStartingCoordinates = async (
    image: Image,
    model: PredefinedMapModel
  ): Promise<Coordinates> => {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const { r, g, b } = image.getRGB({ x, y });
        const color = Color.fromRGB({ r, g, b });

        const hexColors: Set<string> = new Set();
        if (color !== null) {
          if (!hexColors.has(color.hex)) {
            hexColors.add(color.hex);
          }
          const startingPointColor = Colors.colorForName(model.startingPointColor);
          if (Color.equals(color, startingPointColor)) {
            return { x, y };
          }
        }
      }
    }

    throw new Error('No starting point');
  };

  private _loadUnits = async (
    model: PredefinedMapModel,
    image: Image,
    map: MapInstance
  ): Promise<Unit[]> => {
    const { modelLoader, unitFactory } = Globals;
    const units: Unit[] = [];
    const enemyColors = this._toHexColors(model.enemyColors);

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const { r, g, b } = image.getRGB({ x, y });
        const color = Color.fromRGB({ r, g, b });

        const hexColors: Set<string> = new Set();
        if (color !== null) {
          if (!hexColors.has(color.hex)) {
            hexColors.add(color.hex);
          }
          const enemyUnitClass = enemyColors[color.hex] ?? null;
          if (enemyUnitClass !== null) {
            const enemyUnitModel = await modelLoader.loadUnitModel(enemyUnitClass);
            const controller = chooseUnitController(enemyUnitModel.id);
            const unit = await unitFactory.createUnit({
              name: enemyUnitModel.name,
              unitClass: enemyUnitClass,
              faction: Faction.ENEMY,
              controller,
              level: model.levelNumber,
              coordinates: { x, y },
              map
            });
            units.push(unit);
          }
        }
      }
    }
    return units;
  };

  private _loadObjects = async (
    model: PredefinedMapModel,
    image: Image,
    map: MapInstance
  ): Promise<GameObject[]> => {
    const { objectFactory, itemFactory } = Globals;
    const objects: GameObject[] = [];

    const objectColors = this._toHexColors(model.objectColors);
    const itemColors = this._toHexColors(model.itemColors);
    const equipmentColors = this._toHexColors(model.equipmentColors);

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const { r, g, b } = image.getRGB({ x, y });
        const color = Color.fromRGB({ r, g, b });

        const objectName = objectColors?.[color.hex] ?? null;
        if (objectName?.startsWith('door_')) {
          const doorDirection =
            objectName === 'door_horizontal'
              ? DoorDirection.HORIZONTAL
              : DoorDirection.VERTICAL;
          const door = await objectFactory.createDoor(
            { x, y },
            doorDirection,
            false,
            map
          );
          objects.push(door);
        } else {
          if (objectName === 'mirror') {
            const spawner = await objectFactory.createMirror({ x, y }, map);
            objects.push(spawner);
          } else if (objectName === 'movable_block') {
            const block = await objectFactory.createMovableBlock({ x, y }, map);
            objects.push(block);
          } else if (objectName === 'vines') {
            const vines = await objectFactory.createVines({ x, y }, map);
            objects.push(vines);
          } else if (objectName === 'shrine') {
            const shrine = await objectFactory.createShrine({ x, y }, map);
            objects.push(shrine);
          } else if (objectName) {
            throw new Error(`Unrecognized object name: ${objectName}`);
          }
        }

        const itemId = itemColors?.[color.hex] ?? null;
        if (itemId) {
          const item = await itemFactory.createMapItem(itemId, { x, y }, map);
          objects.push(item);
        }

        const equipmentId = equipmentColors?.[color.hex] ?? null;
        if (equipmentId) {
          const equipment = await itemFactory.createMapEquipment(
            equipmentId,
            { x, y },
            map
          );
          objects.push(equipment);
        }
      }
    }

    return objects;
  };

  private _toHexColors = (source?: {
    [colorName: string]: string;
  }): { [hexColor: string]: string } => {
    const hexColors: {
      [hexColor: string]: string;
    } = {};

    for (const [colorName, unitClass] of Object.entries(source ?? {})) {
      const color = Colors.colorForName(colorName);
      hexColors[color.hex] = unitClass;
    }
    return hexColors;
  };
}
