import GameState from '../../core/GameState';
import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { Image } from '../../graphics/images/Image';
import ImageFactory from '../../graphics/images/ImageFactory';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Door from '../../entities/objects/Door';
import ItemFactory from '../../items/ItemFactory';
import MapItem from '../../entities/objects/MapItem';
import Spawner from '../../entities/objects/Spawner';
import SpawnerFactory, { SpawnerClass } from '../../entities/objects/SpawnerFactory';
import Music from '../../sounds/Music';
import Tile from '../../tiles/Tile';
import TileSet from '../../tiles/TileSet';
import UnitController from '../../entities/units/controllers/UnitController';
import Unit from '../../entities/units/Unit';
import UnitFactory from '../../entities/units/UnitFactory';
import { loadPredefinedMapModel, loadUnitModel } from '../../utils/models';
import { checkNotNull } from '../../utils/preconditions';
import MapInstance from '../MapInstance';
import WizardController from '../../entities/units/controllers/WizardController';
import HumanRedesignController from '../../entities/units/controllers/HumanRedesignController';
import PredefinedMapModel from '../../schemas/PredefinedMapModel';
import TileType from '../../schemas/TileType';

/**
 * TODO - there's a lot of duplication in the private methods here.
 * Our object hierarchy needs to be reworked.
 */
class PredefinedMapBuilder {
  private readonly mapClass: string;

  constructor(mapClass: string) {
    this.mapClass = mapClass;
  }

  build = async (): Promise<MapInstance> => {
    const model = await loadPredefinedMapModel(this.mapClass);
    const image = await ImageFactory.getInstance().getImage({
      filename: `maps/${model.imageFilename}`
    });

    return new MapInstance({
      width: image.bitmap.width,
      height: image.bitmap.height,
      tiles: await _loadTiles(model, image),
      units: await _loadUnits(model, image),
      items: await _loadItems(model, image),
      doors: await _loadDoors(model, image),
      spawners: await _loadSpawners(model, image),
      music: (model.music) ? await Music.loadMusic(model.music as string) : null
    });
  };
}

const _loadTiles = async (model: PredefinedMapModel, image: Image): Promise<Tile[][]> => {
  const tileColors = model.tileColors;
  const tileSet = await TileSet.load(model.tileset);
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
      tiles[y][x] = new Tile({
        tileType: tileType as TileType,
        tileSet,
        coordinates: { x, y }
      });
    } else if (model.defaultTile) {
      tiles[y][x] = new Tile({
        tileType: model.defaultTile,
        tileSet,
        coordinates: { x, y }
      });
    }
  }

  return tiles;
};

const _loadUnits = async (mapClass: PredefinedMapModel, image: Image): Promise<Unit[]> => {
  const state = GameState.getInstance();
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
      const startingPointColor = checkNotNull(Colors[mapClass.startingPointColor]);
      if (Color.equals(color, startingPointColor)) {
        const playerUnit = state.getPlayerUnit();
        playerUnit.setCoordinates({ x, y });
        units.push(playerUnit);
      } else {
        const enemyUnitClass = mapClass.enemyColors[color.hex] ?? null;
        if (enemyUnitClass !== null) {
          const enemyUnitModel = await loadUnitModel(enemyUnitClass);
          const controller: UnitController = (enemyUnitModel.type === 'WIZARD')
            ? new WizardController({ state })
            : new HumanRedesignController({ state });
          const unit = await UnitFactory.getInstance().createUnit({
            name: `${enemyUnitModel.name}_${id++}`,
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

const _loadItems = async (mapClass: PredefinedMapModel, image: Image): Promise<MapItem[]> => {
  const items: MapItem[] = [];
  const itemFactory = ItemFactory.getInstance();

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.width;
    const y = Math.floor(Math.floor(i / 4) / image.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const itemClass = mapClass.itemColors[color.hex] ?? null;
    if (itemClass !== null) {
      items.push(await itemFactory.createMapItem(itemClass, { x, y }));
    }

    const equipmentClass = mapClass.equipmentColors[color.hex] ?? null;
    if (equipmentClass !== null) {
      items.push(await itemFactory.createMapEquipment(equipmentClass, { x, y }));
    }
  }

  return items;
};

const _loadDoors = async (mapClass: PredefinedMapModel, image: Image): Promise<Door[]> => {
  const doors: Door[] = [];

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.data.width;
    const y = Math.floor(Math.floor(i / 4) / image.data.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const doorDirection = mapClass.doorColors?.[color.hex] ?? null;
    if (doorDirection !== null) {
      const sprite = await SpriteFactory.getInstance().createDoorSprite();
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

const _loadSpawners = async (mapClass: PredefinedMapModel, image: Image): Promise<Spawner[]> => {
  const spawners: Spawner[] = [];
  const spawnerFactory = new SpawnerFactory({
    spriteFactory: SpriteFactory.getInstance()
  });

  for (let i = 0; i < image.data.data.length; i += 4) {
    const x = Math.floor(i / 4) % image.data.width;
    const y = Math.floor(Math.floor(i / 4) / image.data.width);
    const [r, g, b, a] = image.data.data.slice(i, i + 4);
    const color = Color.fromRGB({ r, g, b });

    const spawnerName = mapClass.spawnerColors?.[color.hex];
    if (spawnerName) {
      spawners.push(await spawnerFactory.createSpawner({ x, y }, spawnerName as SpawnerClass));
    }
  }

  return spawners;
};

export default PredefinedMapBuilder;
