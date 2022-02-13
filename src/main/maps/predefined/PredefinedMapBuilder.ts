import GameState from '../../core/GameState';
import ImageLoader from '../../graphics/images/ImageLoader';
import { traverseImage } from '../../graphics/images/ImageUtils';
import MapItem from '../../items/MapItem';
import Color from '../../types/Color';
import Tile from '../../types/Tile';
import TileSet from '../../types/TileSet';
import { HUMAN_DETERMINISTIC } from '../../units/controllers/AIUnitControllers';
import Unit from '../../units/Unit';
import UnitFactory from '../../units/UnitFactory';
import MapInstance from '../MapInstance';
import PredefinedMapModel from './PredefinedMapModel';

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
      rooms: [], // TODO
      units: await _loadUnits(model, image),
      items: await _loadItems(model, image)
    });
  };
}

const _loadTiles = async (model: PredefinedMapModel, image: ImageData): Promise<Tile[][]> => {
  const tileColors = model.tileColors;
  const tileSet = await TileSet.forName(model.tileset);
  const tiles: Tile[][] = [];
  for (let y = 0; y < image.height; y++) {
    tiles.push([]);
  }

  await traverseImage(image, async ({ x, y, r, g, b }) => {
    const color = Color.fromRGB({ r, g, b });
    if (color !== null) {
      const tileType = tileColors.get(color) || null;
      if (tileType !== null) {
        tiles[y][x] = Tile.create(tileType, tileSet);
      }
    }
  });

  return tiles;
};

const _loadUnits = async (model: PredefinedMapModel, image: ImageData): Promise<Unit[]> => {
  const units: Unit[] = [];
  let id = 1;
  await traverseImage(image, async ({ x, y, r, g, b }) => {
    const color = Color.fromRGB({ r, g, b });
    if (color !== null) {
      if (Color.equals(color, model.startingPointColor)) {
        const { playerUnit } = GameState.getInstance();
        [playerUnit.x, playerUnit.y] = [x, y];
        units.push(playerUnit);
      } else {
        const enemyUnitClass = model.enemyColors.get(color) || null;
        if (enemyUnitClass !== null) {
          const unit = await UnitFactory.createUnit({
            name: `${enemyUnitClass.name}_${id++}`,
            unitClass: enemyUnitClass,
            faction: 'ENEMY',
            controller: HUMAN_DETERMINISTIC,
            level: model.levelNumber,
            coordinates: { x, y }
          });
          units.push(unit);
        }
      }
    }
  });
  return units;
};

const _loadItems = async (model: PredefinedMapModel, image: ImageData): Promise<MapItem[]> => {
  return []; // TODO
};

export default PredefinedMapBuilder;
