import GameState from '../../core/GameState';
import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { Image } from '../../graphics/images/Image';
import ImageFactory from '../../graphics/images/ImageFactory';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Door from '../../entities/objects/Door';
import ItemService from '../../items/ItemService';
import ObjectFactory from '../../entities/objects/ObjectFactory';
import Music from '../../sounds/Music';
import Tile from '../../tiles/Tile';
import UnitController from '../../entities/units/controllers/UnitController';
import Unit from '../../entities/units/Unit';
import GameObject from '../../entities/objects/GameObject';
import UnitFactory from '../../entities/units/UnitFactory';
import { loadPredefinedMapModel, loadUnitModel } from '../../utils/models';
import { checkNotNull, checkState } from '../../utils/preconditions';
import MapInstance from '../MapInstance';
import WizardController from '../../entities/units/controllers/WizardController';
import HumanRedesignController from '../../entities/units/controllers/HumanRedesignController';
import PredefinedMapModel from '../../schemas/PredefinedMapModel';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';

type Props = Readonly<{
  imageFactory: ImageFactory,
  itemService: ItemService,
  spawnerFactory: ObjectFactory,
  spriteFactory: SpriteFactory
  tileFactory: TileFactory,
  unitFactory: UnitFactory,
  state: GameState
}>;

class PredefinedMapBuilder {
  private readonly imageFactory: ImageFactory;
  private readonly itemService: ItemService;
  private readonly objectFactory: ObjectFactory;
  private readonly spriteFactory: SpriteFactory;
  private readonly tileFactory: TileFactory;
  private readonly unitFactory: UnitFactory;
  private readonly state: GameState;

  constructor(props: Props) {
    this.imageFactory = props.imageFactory;
    this.itemService = props.itemService;
    this.objectFactory = props.spawnerFactory;
    this.spriteFactory = props.spriteFactory;
    this.tileFactory = props.tileFactory;
    this.unitFactory = props.unitFactory;
    this.state = props.state;
  }

  build = async (mapId: string): Promise<MapInstance> => {
    const model = await loadPredefinedMapModel(mapId);
    const image = await this.imageFactory.getImage({
      filename: `maps/${model.imageFilename}`
    });

    return new MapInstance({
      width: image.bitmap.width,
      height: image.bitmap.height,
      tiles: await this._loadTiles(model, image),
      units: await this._loadUnits(model, image),
      objects: await this._loadObjects(model, image),
      music: (model.music) ? await Music.loadMusic(model.music as string) : null
    });
  };

  private _loadTiles = async (model: PredefinedMapModel, image: Image): Promise<Tile[][]> => {
    const tileColors = this._toHexColors(model.tileColors);
    const tileSet = await this.tileFactory.getTileSet(model.tileset);
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
        tiles[y][x] = this.tileFactory.createTile({
          tileType: tileType as TileType,
          tileSet,
          coordinates: { x, y }
        });
      } else if (model.defaultTile) {
        tiles[y][x] = this.tileFactory.createTile({
          tileType: model.defaultTile,
          tileSet,
          coordinates: { x, y }
        });
      }
    }

    return tiles;
  };

  private _loadUnits = async (model: PredefinedMapModel, image: Image): Promise<Unit[]> => {
    const state = this.state;
    const units: Unit[] = [];
    let id = 1;

    const enemyColors = this._toHexColors(model.enemyColors);
    let addedStartingPoint = false;

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
            const controller: UnitController = (enemyUnitModel.type === 'WIZARD')
              ? new WizardController({ state })
              : new HumanRedesignController({ state });
            const unit = await this.unitFactory.createUnit({
              name: `${enemyUnitModel.name}_${id++}`,
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
    checkState(addedStartingPoint, "No starting point");
    return units;
  };

  private _loadObjects = async (model: PredefinedMapModel, image: Image): Promise<GameObject[]> => {
    const { spriteFactory } = this;
    const objects: GameObject[] = [];

    const objectColors = this._toHexColors(model.objectColors);

    for (let i = 0; i < image.data.data.length; i += 4) {
      const x = Math.floor(i / 4) % image.data.width;
      const y = Math.floor(Math.floor(i / 4) / image.data.width);
      const [r, g, b, a] = image.data.data.slice(i, i + 4);
      const color = Color.fromRGB({ r, g, b });

      const objectName = objectColors?.[color.hex] ?? null;
      if (objectName?.startsWith('door_')) {
        const doorDirection = (objectName === 'door_horizontal')
          ? 'horizontal'
          : 'vertical';
        const sprite = await spriteFactory.createDoorSprite();

        const door = new Door({
          direction: doorDirection,
          state: 'CLOSED',
          coordinates: { x, y },
          sprite
        });
        objects.push(door);
      } else if (objectName === 'mirror') {
        const spawner = await this.objectFactory.createMirror({ x, y });
        objects.push(spawner);
      } else if (objectName === 'movable_block') {
        const block = await this.objectFactory.createMovableBlock({ x, y });
        objects.push(block);
      } else if (objectName) {
        throw new Error(`Unrecognized object name: ${objectName}`);
      }

      const itemId = (model.itemColors?.[color.hex] ?? null);
      if (itemId) {
        const item = await this.itemService.createMapItem(itemId, { x, y });
        objects.push(item);
      }

      const equipmentId = (model.equipmentColors?.[color.hex] ?? null);
      if (equipmentId) {
        const equipment = await this.itemService.createMapEquipment(equipmentId, { x, y });
        objects.push(equipment);
      }
    }

    return objects;
  };

  private _toHexColors = (
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
  }
}

export default PredefinedMapBuilder;
