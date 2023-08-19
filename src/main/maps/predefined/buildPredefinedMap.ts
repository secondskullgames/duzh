import GameState from '../../core/GameState';
import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { Image } from '../../graphics/images/Image';
import ImageFactory from '../../graphics/images/ImageFactory';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Door, { DoorState } from '../../entities/objects/Door';
import ItemFactory from '../../items/ItemFactory';
import ObjectFactory from '../../entities/objects/ObjectFactory';
import Music from '../../sounds/Music';
import Tile from '../../tiles/Tile';
import Unit from '../../entities/units/Unit';
import GameObject from '../../entities/objects/GameObject';
import UnitFactory from '../../entities/units/UnitFactory';
import { loadPredefinedMapModel, loadUnitModel } from '../../utils/models';
import { checkNotNull, checkState } from '../../utils/preconditions';
import MapInstance from '../MapInstance';
import WizardController from '../../entities/units/controllers/WizardController';
import BasicEnemyController from '../../entities/units/controllers/BasicEnemyController';
import PredefinedMapModel from '../../schemas/PredefinedMapModel';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';
import { Faction } from '../../types/types';
import UnitModel from '../../schemas/UnitModel';
import ArcherController from '../../entities/units/controllers/ArcherController';

type Context = Readonly<{
  imageFactory: ImageFactory,
  spriteFactory: SpriteFactory,
  itemFactory: ItemFactory,
  unitFactory: UnitFactory,
  tileFactory: TileFactory,
  objectFactory: ObjectFactory,
  state: GameState
}>;

const _getEnemyController = (enemyUnitModel: UnitModel) => {
  if (enemyUnitModel.type === 'WIZARD') {
    return new WizardController()
  } else if (enemyUnitModel.id === 'archer') {
    return new ArcherController();
  } else {
    return new BasicEnemyController();
  }
};

export const buildPredefinedMap = async (
  mapId: string,
  context: Context
): Promise<MapInstance> => {
  const { imageFactory } = context;
  const model = await loadPredefinedMapModel(mapId);
  const image = await imageFactory.getImage({
    filename: `maps/${model.imageFilename}`
  });

  return new MapInstance({
    id: mapId,
    width: image.bitmap.width,
    height: image.bitmap.height,
    tiles: await _loadTiles(model, image, context),
    units: await _loadUnits(model, image, context),
    objects: await _loadObjects(model, image, context),
    music: (model.music) ? await Music.loadMusic(model.music as string) : null
  });
};

const _loadTiles = async (
  model: PredefinedMapModel,
  image: Image,
  { tileFactory }: Context
): Promise<Tile[][]> => {
  const tileColors = _toHexColors(model.tileColors);
  const tileSet = await tileFactory.getTileSet(model.tileset);
  const tiles: Tile[][] = [];
  for (let y = 0; y < image.height; y++) {
    tiles.push([]);
    for (let x = 0; x < image.width; x++) {
      const  { r, g, b } = image.getRGB({ x, y });
      const color = Color.fromRGB({ r, g, b });

      const tileType = tileColors[color.hex] ?? null;
      if (tileType !== null) {
        tiles[y][x] = tileFactory.createTile({
          tileType: tileType as TileType,
          tileSet,
          coordinates: { x, y }
        });
      } else {
        throw new Error(`unrecognized color ${color.hex} at ${JSON.stringify({ x, y })}`);
      }
    }
  }

  return tiles;
};

const _loadUnits = async (
  model: PredefinedMapModel,
  image: Image,
  { state, unitFactory }: Context
): Promise<Unit[]> => {
  const units: Unit[] = [];
  const enemyColors = _toHexColors(model.enemyColors);
  let addedStartingPoint = false;

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
          console.log(`starting point = (${x}, ${y})`);
          const playerUnit = state.getPlayerUnit();
          playerUnit.setCoordinates({ x, y });
          units.push(playerUnit);
          addedStartingPoint = true;
        } else {
          const enemyUnitClass = enemyColors[color.hex] ?? null;
          if (enemyUnitClass !== null) {
            const enemyUnitModel = await loadUnitModel(enemyUnitClass);
            const controller = _getEnemyController(enemyUnitModel);
            const unit = await unitFactory.createUnit({
              name: enemyUnitModel.name,
              unitClass: enemyUnitClass,
              faction: Faction.ENEMY,
              controller,
              level: model.levelNumber,
              coordinates: { x, y }
            });
            units.push(unit);
          }
        }
      }
    }
  }
  checkState(addedStartingPoint, "No starting point");
  return units;
};

const _loadObjects = async (
  model: PredefinedMapModel,
  image: Image,
  { spriteFactory, itemFactory, objectFactory }: Context
): Promise<GameObject[]> => {
  const objects: GameObject[] = [];

  const objectColors = _toHexColors(model.objectColors);
  const itemColors = _toHexColors(model.itemColors);
  const equipmentColors = _toHexColors(model.equipmentColors);

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const { r, g, b } = image.getRGB({ x, y });
      const color = Color.fromRGB({ r, g, b });

      const objectName = objectColors?.[color.hex] ?? null;
      if (objectName?.startsWith('door_')) {
        // TODO why this is not in ObjectFactory?
        const doorDirection = (objectName === 'door_horizontal')
          ? 'horizontal'
          : 'vertical';
        const sprite = await spriteFactory.createDoorSprite();

        const door = new Door({
          direction: doorDirection,
          state: DoorState.CLOSED,
          coordinates: { x, y },
          sprite
        });
        objects.push(door);
      } else {
        if (objectName === 'mirror') {
          const spawner = await objectFactory.createMirror({ x, y });
          objects.push(spawner);
        } else if (objectName === 'movable_block') {
          const block = await objectFactory.createMovableBlock({ x, y });
          objects.push(block);
        } else if (objectName) {
          throw new Error(`Unrecognized object name: ${objectName}`);
        }
      }

      const itemId = (itemColors?.[color.hex] ?? null);
      if (itemId) {
        const item = await itemFactory.createMapItem(itemId, { x, y });
        objects.push(item);
      }

      const equipmentId = (equipmentColors?.[color.hex] ?? null);
      if (equipmentId) {
        const equipment = await itemFactory.createMapEquipment(equipmentId, { x, y });
        objects.push(equipment);
      }
    }
  }

  return objects;
};

const _toHexColors = (
  source?: { [colorName: string]: string }
): { [hexColor: string]: string } => {
  const hexColors: {
    [hexColor: string]: string
  } = {};

  for (const [colorName, unitClass] of Object.entries(source ?? {})) {
    const color = checkNotNull(Colors[colorName]);
    hexColors[color.hex] = unitClass;
  }
  return hexColors;
};
