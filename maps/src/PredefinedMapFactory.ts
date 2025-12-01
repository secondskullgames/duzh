import {
  AssetBundle,
  DoorDirection,
  PredefinedMapModel,
  TileType,
  UnitModel
} from '@duzh/models';
import { Coordinates, Grid, MultiGrid } from '@duzh/geometry';
import { MapTemplate } from './MapTemplate.js';
import { checkNotNull } from '@duzh/utils/preconditions';
import { Image, ImageFactory } from '@duzh/graphics/images';
import { Color } from '@duzh/graphics';
import { ObjectTemplate } from './ObjectTemplate.js';

export class PredefinedMapFactory {
  constructor(
    private readonly imageFactory: ImageFactory,
    private readonly assetBundle: AssetBundle
  ) {}

  buildPredefinedMap = async (mapId: string): Promise<MapTemplate> => {
    const model = checkNotNull(this.assetBundle.predefinedMaps[mapId]);
    const image = await this.imageFactory.getImage({
      filename: `maps/${model.imageFilename}`
    });

    const startingCoordinates = await this._loadStartingCoordinates(image, model);
    const tiles = await this._loadTiles(model, image);
    const units = await this._loadUnits(model, image);
    const objects = await this._loadObjects(model, image);
    const music = model.music ? checkNotNull(this.assetBundle.music[model.music]) : null;

    return {
      id: model.id,
      width: image.width,
      height: image.height,
      levelNumber: model.levelNumber,
      startingCoordinates,
      tiles,
      tileSet: model.tileset,
      units,
      objects,
      music,
      fogParams: model.fogOfWar
    };
  };

  private _loadTiles = async (
    model: PredefinedMapModel,
    image: Image
  ): Promise<Grid<TileType>> => {
    const tileColors = this._toHexColors(model.tileColors);
    const { width, height } = image;
    const tiles = new Grid<TileType>({ width, height });
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const { r, g, b } = image.getRGB({ x, y });
        const color = Color.fromRGB({ r, g, b });

        const tileType = tileColors[color.hex] ?? model.defaultTile ?? null;
        if (tileType !== null) {
          tiles.put({ x, y }, tileType as TileType);
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
          const startingPointColor = Color.fromHex(
            checkNotNull(this.assetBundle.colors[model.startingPointColor])
          );
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
    image: Image
  ): Promise<Grid<UnitModel>> => {
    const { width, height } = image;
    const units = new Grid<UnitModel>({ width, height });
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
          const unitModelId = enemyColors[color.hex] ?? null;
          if (unitModelId !== null) {
            const unitModel = checkNotNull(this.assetBundle.units[unitModelId]);
            units.put({ x, y }, unitModel);
          }
        }
      }
    }
    return units;
  };

  private _loadObjects = async (
    model: PredefinedMapModel,
    image: Image
  ): Promise<MultiGrid<ObjectTemplate>> => {
    const { width, height } = image;
    const objects = new MultiGrid<ObjectTemplate>({ width, height });

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

          objects.put(
            { x, y },
            { type: 'door', direction: doorDirection, locked: false }
          );
        } else {
          if (objectName === 'mirror') {
            objects.put({ x, y }, { type: 'mirror' });
          } else if (objectName === 'movable_block') {
            objects.put({ x, y }, { type: 'movable_block' });
          } else if (objectName === 'vines') {
            objects.put({ x, y }, { type: 'vines' });
          } else if (objectName === 'shrine') {
            objects.put({ x, y }, { type: 'shrine' });
          } else if (objectName) {
            throw new Error(`Unrecognized object name: ${objectName}`);
          }
        }

        const itemId = itemColors?.[color.hex] ?? null;
        if (itemId) {
          const itemModel = checkNotNull(this.assetBundle.items[itemId]);
          objects.put({ x, y }, { type: 'item', model: itemModel });
        }

        const equipmentId = equipmentColors?.[color.hex] ?? null;
        if (equipmentId) {
          const equipmentModel = checkNotNull(this.assetBundle.equipment[equipmentId]);
          objects.put({ x, y }, { type: 'equipment', model: equipmentModel });
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
      const hexColor = checkNotNull(this.assetBundle.colors[colorName]);
      hexColors[hexColor] = unitClass;
    }
    return hexColors;
  };
}
