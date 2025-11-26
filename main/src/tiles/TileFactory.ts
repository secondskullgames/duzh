import { TileSet } from './TileSet';
import Tile from './Tile';
import Sprite from '../graphics/sprites/Sprite';
import SpriteFactory from '../graphics/sprites/SpriteFactory';
import MapInstance from '../maps/MapInstance';
import { AssetBundle, TileType } from '@duzh/models';
import { Coordinates } from '@duzh/geometry';
import { checkNotNull } from '@duzh/utils/preconditions';
import { randChoice } from '@duzh/utils/random';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';

type CreateTileParams = Readonly<{
  tileType: TileType;
  tileSet: TileSet;
}>;

export default class TileFactory {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly spriteFactory: SpriteFactory
  ) {}

  createTile = (
    { tileType, tileSet }: CreateTileParams,
    coordinates: Coordinates,
    map: MapInstance
  ): Tile => {
    const tilesOfType = checkNotNull(tileSet[tileType]);
    const sprite = randChoice(tilesOfType);
    return new Tile({ tileType, sprite, coordinates, map });
  };

  getTileSet = async (id: string): Promise<TileSet> => {
    const model = checkNotNull(this.assetBundle.tileSets[id]);
    const tileSet: {
      [key in TileType]?: (Sprite | null)[];
    } = {};

    for (const [tileType, filenames] of Object.entries(model.tiles)) {
      const tileSprites: Sprite[] = [];
      for (let index = 0; index < filenames.length; index++) {
        const filename = filenames[index];
        if (filename) {
          const paletteSwaps = loadPaletteSwaps(
            model.paletteSwaps ?? {},
            this.assetBundle
          );
          const tileSprite = await this.spriteFactory.createTileSprite(
            `${model.path}/${filename}`,
            paletteSwaps
          );
          tileSprites.push(tileSprite);
        }
      }
      tileSet[tileType as TileType] = tileSprites;
    }

    return tileSet as TileSet;
  };
}
