import GameState from '../../core/GameState';
import Color from '../../graphics/Color';
import ImageLoader from '../../graphics/images/ImageLoader';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Door from '../../objects/Door';
import ItemFactory from '../../items/ItemFactory';
import MapItem from '../../objects/MapItem';
import Spawner from '../../objects/Spawner';
import SpawnerFactory, { SpawnerClass } from '../../objects/SpawnerFactory';
import Tile from '../../tiles/Tile';
import TileSet from '../../tiles/TileSet';
import { HUMAN_REDESIGN, WIZARD } from '../../units/controllers/AIUnitControllers';
import UnitController from '../../units/controllers/UnitController';
import Unit from '../../units/Unit';
import UnitFactory from '../../units/UnitFactory';
import MapInstance from '../MapInstance';
import PredefinedMapModel from './PredefinedMapModel';

/**
 * TODO - there's a lot of duplication in the private methods here.
 * Our object hierarchy needs to be reworked.
 */
class PredefinedMapBuilder {
  private readonly model: PredefinedMapModel;

  constructor(model: PredefinedMapModel) {
    this.model = model;
  }

  build = async (): Promise<MapInstance> => {
    const { model } = this;
    const image = await ImageLoader.loadImage(`maps/${model.imageFilename}`);

    return new MapInstance({
      width: image.width,
      height: image.height,
      tiles: await _loadTiles(model, image),
      units: await _loadUnits(model, image),
      items: await _loadItems(model, image),
      doors: await _loadDoors(model, image),
      spawners: await _loadSpawners(model, image),
      music: model.music
    });
  };
}

const _loadTiles = async (model: PredefinedMapModel, imageData: ImageData): Promise<Tile[][]> => {
  const tileColors = model.tileColors;
  const tileSet = await TileSet.forName(model.tileset);
  const tiles: Tile[][] = [];
  for (let y = 0; y < imageData.height; y++) {
    tiles.push([]);
  }

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = Math.floor(i / 4) % imageData.width;
    const y = Math.floor(Math.floor(i / 4) / imageData.width);
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const tileType = tileColors.get(color) || null;
    if (tileType !== null) {
      tiles[y][x] = Tile.create(tileType, tileSet);
    } else if (model.defaultTile) {
      tiles[y][x] = Tile.create(model.defaultTile, tileSet);
    }
  }

  return tiles;
};

const _loadUnits = async (model: PredefinedMapModel, imageData: ImageData): Promise<Unit[]> => {
  const units: Unit[] = [];
  let id = 1;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = Math.floor(i / 4) % imageData.width;
    const y = Math.floor(Math.floor(i / 4) / imageData.width);
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const hexColors: Set<string> = new Set();
    if (color !== null) {
      if (!hexColors.has(color.hex)) {
        hexColors.add(color.hex);
      }
      if (Color.equals(color, model.startingPointColor)) {
        const playerUnit = GameState.getInstance().getPlayerUnit();
        [playerUnit.x, playerUnit.y] = [x, y];
        units.push(playerUnit);
      } else {
        const enemyUnitClass = model.enemyColors.get(color) || null;
        if (enemyUnitClass !== null) {
          const controller: UnitController = (enemyUnitClass.type === 'WIZARD') ? WIZARD : HUMAN_REDESIGN;
          const unit = await UnitFactory.createUnit({
            name: `${enemyUnitClass.name}_${id++}`,
            unitClass: enemyUnitClass,
            faction: 'ENEMY',
            controller,
            level: model.levelNumber,
            coordinates: { x, y }
          });
          units.push(unit);
        }
      }
    }
  }
  return units;
};

const _loadItems = async (model: PredefinedMapModel, imageData: ImageData): Promise<MapItem[]> => {
  const items: MapItem[] = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = Math.floor(i / 4) % imageData.width;
    const y = Math.floor(Math.floor(i / 4) / imageData.width);
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const itemClass = model.itemColors.get(color) || null;
    if (itemClass !== null) {
      items.push(await ItemFactory.createMapItem(itemClass, { x, y }));
    }

    const equipmentClass = model.equipmentColors.get(color) || null;
    if (equipmentClass !== null) {
      items.push(await ItemFactory.createMapEquipment(equipmentClass, { x, y }));
    }
  }

  return items;
};

const _loadDoors = async (model: PredefinedMapModel, imageData: ImageData): Promise<Door[]> => {
  const doors: Door[] = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = Math.floor(i / 4) % imageData.width;
    const y = Math.floor(Math.floor(i / 4) / imageData.width);
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const doorDirection = model.doorColors.get(color) || null;
    if (doorDirection !== null) {
      const sprite = await SpriteFactory.createDoorSprite();
      const door = new Door({
        direction: doorDirection,
        state: 'CLOSED',
        x,
        y,
        sprite
      });
      doors.push(door);
    }
  }

  return doors;
};

const _loadSpawners = async (model: PredefinedMapModel, imageData: ImageData): Promise<Spawner[]> => {
  const spawners: Spawner[] = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = Math.floor(i / 4) % imageData.width;
    const y = Math.floor(Math.floor(i / 4) / imageData.width);
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const spawnerName = model.spawnerColors.get(color);
    if (spawnerName) {
      spawners.push(await SpawnerFactory.createSpawner({ x, y }, spawnerName as SpawnerClass));
    }
  }

  return spawners;
};

export default PredefinedMapBuilder;
