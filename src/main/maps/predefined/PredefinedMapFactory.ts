import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { Image } from '../../graphics/images/Image';
import Door, { DoorState } from '../../entities/objects/Door';
import Music from '../../sounds/Music';
import Tile from '../../tiles/Tile';
import Unit from '../../entities/units/Unit';
import GameObject from '../../entities/objects/GameObject';
import { loadPredefinedMapModel, loadUnitModel } from '../../utils/models';
import { checkNotNull } from '../../utils/preconditions';
import MapInstance from '../MapInstance';
import WizardController from '../../entities/units/controllers/WizardController';
import BasicEnemyController from '../../entities/units/controllers/BasicEnemyController';
import PredefinedMapModel from '../../schemas/PredefinedMapModel';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';
import { Faction } from '../../types/types';
import UnitModel from '../../schemas/UnitModel';
import ArcherController from '../../entities/units/controllers/ArcherController';
import DragonShooterController from '../../entities/units/controllers/DragonShooterController';
import Coordinates from '../../geometry/Coordinates';
import { GameState } from '../../core/GameState';
import ImageFactory from '../../graphics/images/ImageFactory';
import ItemFactory from '../../items/ItemFactory';
import UnitFactory from '../../entities/units/UnitFactory';
import ObjectFactory from '../../entities/objects/ObjectFactory';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import { injectable } from 'inversify';

/** TODO this should go somewhere else */
const _getEnemyController = (enemyUnitModel: UnitModel) => {
  if (enemyUnitModel.type === 'WIZARD') {
    return new WizardController();
  } else if (enemyUnitModel.id === 'archer') {
    return new ArcherController();
  } else if (enemyUnitModel.id === 'dragon_shooter') {
    return new DragonShooterController();
  } else {
    return new BasicEnemyController();
  }
};

@injectable()
export class PredefinedMapFactory {
  constructor(
    private readonly imageFactory: ImageFactory,
    private readonly tileFactory: TileFactory,
    private readonly objectFactory: ObjectFactory,
    private readonly unitFactory: UnitFactory,
    private readonly itemFactory: ItemFactory,
    private readonly spriteFactory: SpriteFactory
  ) {}

  buildPredefinedMap = async (mapId: string, state: GameState): Promise<MapInstance> => {
    const model = await loadPredefinedMapModel(mapId);
    const image = await this.imageFactory.getImage({
      filename: `maps/${model.imageFilename}`
    });

    const startingCoordinates = await this._loadStartingCoordinates(image, model);
    const map = new MapInstance({
      width: image.bitmap.width,
      height: image.bitmap.height,
      startingCoordinates,
      music: model.music ? await Music.loadMusic(model.music) : null
    });

    const tiles = await this._loadTiles(model, image, map);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.addTile(tiles[y][x]);
      }
    }

    const units = await this._loadUnits(model, image, state, map);
    for (const unit of units) {
      map.addUnit(unit);
    }

    const objects = await this._loadObjects(model, image, state, map);
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
    const tileColors = this._toHexColors(model.tileColors);
    const tileSet = await this.tileFactory.getTileSet(model.tileset);
    const tiles: Tile[][] = [];
    for (let y = 0; y < image.height; y++) {
      tiles.push([]);
      for (let x = 0; x < image.width; x++) {
        const { r, g, b } = image.getRGB({ x, y });
        const color = Color.fromRGB({ r, g, b });

        const tileType = tileColors[color.hex] ?? model.defaultTile ?? null;
        if (tileType !== null) {
          tiles[y][x] = this.tileFactory.createTile(
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
          const startingPointColor = checkNotNull(Colors[model.startingPointColor]);
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
    state: GameState,
    map: MapInstance
  ): Promise<Unit[]> => {
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
            const enemyUnitModel = await loadUnitModel(enemyUnitClass);
            const controller = _getEnemyController(enemyUnitModel);
            const unit = await this.unitFactory.createUnit({
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
    state: GameState,
    map: MapInstance
  ): Promise<GameObject[]> => {
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
            objectName === 'door_horizontal' ? 'horizontal' : 'vertical';
          const sprite = await this.spriteFactory.createDoorSprite();

          const door = new Door({
            direction: doorDirection,
            state: DoorState.CLOSED,
            coordinates: { x, y },
            map,
            sprite
          });
          objects.push(door);
        } else {
          if (objectName === 'mirror') {
            const spawner = await this.objectFactory.createMirror({ x, y }, map);
            objects.push(spawner);
          } else if (objectName === 'movable_block') {
            const block = await this.objectFactory.createMovableBlock({ x, y }, map);
            objects.push(block);
          } else if (objectName) {
            throw new Error(`Unrecognized object name: ${objectName}`);
          }
        }

        const itemId = itemColors?.[color.hex] ?? null;
        if (itemId) {
          const item = await this.itemFactory.createMapItem(itemId, { x, y }, map);
          objects.push(item);
        }

        const equipmentId = equipmentColors?.[color.hex] ?? null;
        if (equipmentId) {
          const equipment = await this.itemFactory.createMapEquipment(
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
      const color = checkNotNull(Colors[colorName]);
      hexColors[color.hex] = unitClass;
    }
    return hexColors;
  };
}