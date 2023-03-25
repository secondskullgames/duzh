import GameState from '../../core/GameState';
import Color from '../../graphics/Color';
import Colors from '../../graphics/Colors';
import { Image } from '../../graphics/images/Image';
import ImageFactory from '../../graphics/images/ImageFactory';
import SpriteFactory from '../../graphics/sprites/SpriteFactory';
import Door from '../../entities/objects/Door';
import ItemFactory from '../../items/ItemFactory';
import ObjectFactory from '../../entities/objects/ObjectFactory';
import Music from '../../sounds/Music';
import Tile from '../../tiles/Tile';
import UnitController from '../../entities/units/controllers/UnitController';
import Unit from '../../entities/units/Unit';
import Object from '../../entities/objects/Object';
import UnitFactory from '../../entities/units/UnitFactory';
import { loadPredefinedMapModel, loadUnitModel } from '../../utils/models';
import { checkNotNull } from '../../utils/preconditions';
import MapInstance from '../MapInstance';
import WizardController from '../../entities/units/controllers/WizardController';
import HumanRedesignController from '../../entities/units/controllers/HumanRedesignController';
import PredefinedMapModel from '../../schemas/PredefinedMapModel';
import TileType from '../../schemas/TileType';
import TileFactory from '../../tiles/TileFactory';

type Props = Readonly<{
  imageFactory: ImageFactory,
  itemFactory: ItemFactory,
  spawnerFactory: ObjectFactory,
  spriteFactory: SpriteFactory
  tileFactory: TileFactory,
  unitFactory: UnitFactory,
  state: GameState
}>;

class PredefinedMapBuilder {
  private readonly imageFactory: ImageFactory;
  private readonly itemFactory: ItemFactory;
  private readonly objectFactory: ObjectFactory;
  private readonly spriteFactory: SpriteFactory;
  private readonly tileFactory: TileFactory;
  private readonly unitFactory: UnitFactory;
  private readonly state: GameState;

  constructor(props: Props) {
    this.imageFactory = props.imageFactory;
    this.itemFactory = props.itemFactory;
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
    const tileColors = model.tileColors;
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

  private _loadUnits = async (mapClass: PredefinedMapModel, image: Image): Promise<Unit[]> => {
    const state = this.state;
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
            const unit = await this.unitFactory.createUnit({
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

  private _loadObjects = async (mapClass: PredefinedMapModel, image: Image): Promise<Object[]> => {
    const { spriteFactory } = this;
    const objects: Object[] = [];

    for (let i = 0; i < image.data.data.length; i += 4) {
      const x = Math.floor(i / 4) % image.data.width;
      const y = Math.floor(Math.floor(i / 4) / image.data.width);
      const [r, g, b, a] = image.data.data.slice(i, i + 4);
      const color = Color.fromRGB({ r, g, b });

      const objectName = mapClass.objectColors?.[color.hex] ?? null;
      switch (objectName) {
        case 'door_horizontal':
        case 'door_vertical': {
          const sprite = await spriteFactory.createDoorSprite();
          const doorDirection = (objectName === 'door_horizontal')
            ? 'horizontal'
            : 'vertical';
          const door = new Door({
            direction: doorDirection,
            state: 'CLOSED',
            coordinates: { x, y },
            sprite
          });
          objects.push(door);
          break;
        }
        case 'mirror': {
          const spawner = await this.objectFactory.createMirror({ x, y });
          objects.push(spawner);
          break;
        }
        case 'block': {
          const block = await this.objectFactory.createMovableBlock({ x, y });
          objects.push(block);
          break;
        }
      }
    }

    return objects;
  };
}



export default PredefinedMapBuilder;
