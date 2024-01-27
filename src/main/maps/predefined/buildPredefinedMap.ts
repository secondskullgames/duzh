import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { Image } from '../../graphics/images/Image';
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
import DragonShooterController from '../../entities/units/controllers/DragonShooterController';
import ImageFactory from '../../graphics/images/ImageFactory';
import { Session } from '../../core/Session';

type Context = Readonly<{
  imageFactory: ImageFactory;
  session: Session;
}>;

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

export const buildPredefinedMap = async (
  mapId: string,
  { session, imageFactory }: Context
): Promise<MapInstance> => {
  const model = await loadPredefinedMapModel(mapId);
  const image = await imageFactory.getImage({
    filename: `maps/${model.imageFilename}`
  });

  const tiles = await _loadTiles(model, image, { session, imageFactory });
  const startingCoordinates = (() => {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x].getTileType() === 'STAIRS_UP') {
          return { x, y };
        }
      }
    }
    throw new Error('No starting point');
  })();

  return new MapInstance({
    width: image.bitmap.width,
    height: image.bitmap.height,
    tiles,
    startingCoordinates,
    units: await _loadUnits(model, image, { session, imageFactory }),
    objects: await _loadObjects(model, image, { session, imageFactory }),
    music: model.music ? await Music.loadMusic(model.music as string) : null
  });
};

const _loadTiles = async (
  model: PredefinedMapModel,
  image: Image,
  { imageFactory }: Context
): Promise<Tile[][]> => {
  const tileColors = _toHexColors(model.tileColors);
  const tileSet = await TileFactory.getTileSet(model.tileset, { imageFactory });
  const tiles: Tile[][] = [];
  for (let y = 0; y < image.height; y++) {
    tiles.push([]);
    for (let x = 0; x < image.width; x++) {
      const { r, g, b } = image.getRGB({ x, y });
      const color = Color.fromRGB({ r, g, b });

      const tileType = tileColors[color.hex] ?? model.defaultTile ?? null;
      if (tileType !== null) {
        tiles[y][x] = TileFactory.createTile({
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
  { session, imageFactory }: Context
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
          const playerUnit = session.getPlayerUnit();
          playerUnit.setCoordinates({ x, y });
          units.push(playerUnit);
          addedStartingPoint = true;
        } else {
          const enemyUnitClass = enemyColors[color.hex] ?? null;
          if (enemyUnitClass !== null) {
            const enemyUnitModel = await loadUnitModel(enemyUnitClass);
            const controller = _getEnemyController(enemyUnitModel);
            const unit = await UnitFactory.createUnit(
              {
                name: enemyUnitModel.name,
                unitClass: enemyUnitClass,
                faction: Faction.ENEMY,
                controller,
                level: model.levelNumber,
                coordinates: { x, y }
              },
              { imageFactory }
            );
            units.push(unit);
          }
        }
      }
    }
  }
  checkState(addedStartingPoint, 'No starting point');
  return units;
};

const _loadObjects = async (
  model: PredefinedMapModel,
  image: Image,
  { imageFactory }: Context
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
        const doorDirection =
          objectName === 'door_horizontal' ? 'horizontal' : 'vertical';
        const sprite = await SpriteFactory.createDoorSprite({ imageFactory });

        const door = new Door({
          direction: doorDirection,
          state: DoorState.CLOSED,
          coordinates: { x, y },
          sprite
        });
        objects.push(door);
      } else {
        if (objectName === 'mirror') {
          const spawner = await ObjectFactory.createMirror({ x, y }, { imageFactory });
          objects.push(spawner);
        } else if (objectName === 'movable_block') {
          const block = await ObjectFactory.createMovableBlock(
            { x, y },
            { imageFactory }
          );
          objects.push(block);
        } else if (objectName) {
          throw new Error(`Unrecognized object name: ${objectName}`);
        }
      }

      const itemId = itemColors?.[color.hex] ?? null;
      if (itemId) {
        const item = await ItemFactory.createMapItem(itemId, { x, y }, { imageFactory });
        objects.push(item);
      }

      const equipmentId = equipmentColors?.[color.hex] ?? null;
      if (equipmentId) {
        const equipment = await ItemFactory.createMapEquipment(
          equipmentId,
          { x, y },
          { imageFactory }
        );
        objects.push(equipment);
      }
    }
  }

  return objects;
};

const _toHexColors = (source?: {
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
