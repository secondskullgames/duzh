import TileType from '../schemas/TileType';
import Sprite from '../graphics/sprites/Sprite';
import PaletteSwaps from '../graphics/PaletteSwaps';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import TileSet from './TileSet';
import Coordinates from '../geometry/Coordinates';
import Tile from './Tile';
import { checkNotNull } from '../utils/preconditions';
import { randChoice } from '../utils/random';
import { loadTileSetModel } from '../utils/models';
import ImageFactory from '../graphics/images/ImageFactory';

type CreateTileProps = Readonly<{
  tileType: TileType,
  tileSet: TileSet,
  coordinates: Coordinates
}>;

export default class TileFactory {
  getTileSet = async (id: string): Promise<TileSet> => {
    const model = await loadTileSetModel(id);
    const tileSet: {
      [key in TileType]?: (Sprite | null)[]
    } = {};

    for (const [tileType, filenames] of Object.entries(model.tiles)) {
      const tileSprites: Sprite[] = [];
      for (let index = 0; index < filenames.length; index++) {
        const filename = filenames[index];
        if (filename) {
          const paletteSwaps = PaletteSwaps.create(model.paletteSwaps ?? {});
          const tileSprite = await SpriteFactory.createTileSprite(`${model.path}/${filename}`, paletteSwaps, {
            imageFactory: ImageFactory.getInstance()
          });
          tileSprites.push(tileSprite);
        }
      }
      tileSet[tileType as TileType] = tileSprites;
    }

    return tileSet as TileSet;
  };

  createTile = ({ tileType, tileSet, coordinates }: CreateTileProps): Tile => {
    const tilesOfType = checkNotNull(tileSet[tileType]);
    const sprite = randChoice(tilesOfType);
    return new Tile({ tileType, sprite, coordinates });
  };
}