import GameState from '../../core/GameState';
import Color from '../../graphics/Color';
import Image from '../../graphics/images/Image';
import ImageFactory from '../../graphics/images/ImageFactory';
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
import PredefinedMapClass from './PredefinedMapClass';

/**
 * TODO - there's a lot of duplication in the private methods here.
 * Our object hierarchy needs to be reworked.
 */
class PredefinedMapBuilder {
  private readonly mapClass: PredefinedMapClass;

  constructor(mapClass: PredefinedMapClass) {
    this.mapClass = mapClass;
  }

  build = async (): Promise<MapInstance> => {
    const { mapClass } = this;
    const image = await ImageFactory.getImage({
      filename: `maps/${mapClass.imageFilename}`
    });

    return new MapInstance({
      width: image.bitmap.width,
      height: image.bitmap.height,
      tiles: await _loadTiles(mapClass, image),
      units: await _loadUnits(mapClass, image),
      items: await _loadItems(mapClass, image),
      doors: await _loadDoors(mapClass, image),
      spawners: await _loadSpawners(mapClass, image),
      music: mapClass.music
    });
  };
}

const _loadTiles = async (mapClass: PredefinedMapClass, image: Image): Promise<Tile[][]> => {
  const tileColors = mapClass.tileColors;
  const tileSet = await TileSet.load(mapClass.tileset);
  const tiles: Tile[][] = [];
  for (let y = 0; y < image.bitmap.height; y++) {
    tiles.push([]);
  }

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.width;
    const y = Math.floor(Math.floor(i / 4) / image.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const tileType = tileColors[color.hex] ?? null;
    if (tileType !== null) {
      tiles[y][x] = Tile.create(tileType, tileSet);
    } else if (mapClass.defaultTile) {
      tiles[y][x] = Tile.create(mapClass.defaultTile, tileSet);
    }
  }

  return tiles;
};

const _loadUnits = async (mapClass: PredefinedMapClass, image: Image): Promise<Unit[]> => {
  const units: Unit[] = [];
  let id = 1;

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.width;
    const y = Math.floor(Math.floor(i / 4) / image.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const hexColors: Set<string> = new Set();
    if (color !== null) {
      if (!hexColors.has(color.hex)) {
        hexColors.add(color.hex);
      }
      if (Color.equals(color, mapClass.startingPointColor)) {
        const playerUnit = GameState.getInstance().getPlayerUnit();
        playerUnit.setCoordinates({ x, y });
        units.push(playerUnit);
      } else {
        const enemyUnitClass = mapClass.enemyColors[color.hex] ?? null;
        if (enemyUnitClass !== null) {
          const controller: UnitController = (enemyUnitClass.type === 'WIZARD') ? WIZARD : HUMAN_REDESIGN;
          const unit = await UnitFactory.createUnit({
            name: `${enemyUnitClass.name}_${id++}`,
            unitClass: enemyUnitClass,
            faction: 'ENEMY',
            controller,
            level: mapClass.levelNumber,
            coordinates: { x, y }
          });
          units.push(unit);
        }
      }
    }
  }
  return units;
};

const _loadItems = async (mapClass: PredefinedMapClass, image: Image): Promise<MapItem[]> => {
  const items: MapItem[] = [];

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.width;
    const y = Math.floor(Math.floor(i / 4) / image.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const itemClass = mapClass.itemColors[color.hex] ?? null;
    if (itemClass !== null) {
      items.push(await ItemFactory.createMapItem(itemClass, { x, y }));
    }

    const equipmentClass = mapClass.equipmentColors[color.hex] ?? null;
    if (equipmentClass !== null) {
      items.push(await ItemFactory.createMapEquipment(equipmentClass, { x, y }));
    }
  }

  return items;
};

const _loadDoors = async (mapClass: PredefinedMapClass, image: Image): Promise<Door[]> => {
  const doors: Door[] = [];

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.data.width;
    const y = Math.floor(Math.floor(i / 4) / image.data.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const doorDirection = mapClass.doorColors[color.hex] ?? null;
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

const _loadSpawners = async (mapClass: PredefinedMapClass, image: Image): Promise<Spawner[]> => {
  const spawners: Spawner[] = [];

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.data.width;
    const y = Math.floor(Math.floor(i / 4) / image.data.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const spawnerName = mapClass.spawnerColors[color.hex];
    if (spawnerName) {
      spawners.push(await SpawnerFactory.createSpawner({ x, y }, spawnerName as SpawnerClass));
    }
  }

  return spawners;
};

export default PredefinedMapBuilder;
