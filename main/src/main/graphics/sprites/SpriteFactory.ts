import DynamicSprite from './DynamicSprite';
import Sprite from './Sprite';
import { SpriteCategory } from './SpriteCategory';
import StaticSprite from './StaticSprite';
import { SpawnerSprite } from './SpawnerSprite';
import { DoorSprite } from './DoorSprite';
import { EquipmentSprite } from './EquipmentSprite';
import { UnitSprite } from './UnitSprite';
import Door, { DoorState } from '../../objects/Door';
import Spawner, { SpawnerState } from '../../objects/Spawner';
import { Color, PaletteSwaps } from '@duzh/graphics';
import Unit from '@main/units/Unit';
import { Direction } from '@duzh/geometry';
import { fillTemplate } from '@lib/utils/templates';
import { Image, ImageEffect, ImageFactory } from '@duzh/graphics/images';
import { loadPaletteSwaps } from '@main/graphics/loadPaletteSwaps';
import { ImageEffects } from '@main/graphics/ImageEffects';
import { DoorDirection, DynamicSpriteModel } from '@duzh/models';
import Shrine from '@main/objects/Shrine';
import { ShrineSprite } from '@main/graphics/sprites/ShrineSprite';
import { AssetBundle } from '@duzh/models';
import { checkNotNull } from '@duzh/utils/preconditions';

export default class SpriteFactory {
  constructor(
    private readonly assetBundle: AssetBundle,
    private readonly imageFactory: ImageFactory
  ) {}

  /**
   * Tiles don't use JSON models and are assumed to use baseline parameters (white = transparent, offsets = (0, 0))
   */
  createTileSprite = async (
    filename: string,
    paletteSwaps: PaletteSwaps
  ): Promise<Sprite> => {
    const { imageFactory } = this;
    const offsets = { dx: 0, dy: 0 };
    const transparentColor = Color.WHITE;
    const image = await imageFactory.getImage({
      filename: `tiles/${filename}`,
      paletteSwaps,
      transparentColor
    });
    return new StaticSprite(image, offsets);
  };

  createStaticSprite = async (
    modelId: string,
    paletteSwaps?: PaletteSwaps
  ): Promise<Sprite> => {
    const { assetBundle, imageFactory } = this;
    const model = checkNotNull(assetBundle.staticSprites[modelId]);
    const { filename, offsets, transparentColor } = model;
    if (!paletteSwaps) {
      paletteSwaps = loadPaletteSwaps(model.paletteSwaps, assetBundle);
    }
    const image = await imageFactory.getImage({
      filename,
      paletteSwaps,
      transparentColor: transparentColor
        ? Color.fromHex(checkNotNull(assetBundle.colors[transparentColor]))
        : null
    });
    return new StaticSprite(image, offsets);
  };

  createUnitSprite = async (
    modelId: string,
    paletteSwaps: PaletteSwaps
  ): Promise<DynamicSprite<Unit>> => {
    const model = checkNotNull(this.assetBundle.dynamicSprites[modelId]);
    const imageMap = await this._loadAnimations(
      SpriteCategory.UNITS,
      model,
      paletteSwaps
    );

    return new UnitSprite({
      spriteName: modelId,
      imageMap,
      offsets: model.offsets
    });
  };

  createEquipmentSprite = async (modelId: string, paletteSwaps: PaletteSwaps) => {
    const model = checkNotNull(this.assetBundle.dynamicSprites[modelId]);
    const imageMap = await this._loadAnimations(
      SpriteCategory.EQUIPMENT,
      model,
      paletteSwaps
    );

    return new EquipmentSprite({
      spriteName: modelId,
      imageMap,
      offsets: model.offsets
    });
  };

  /**
   * TODO - these aren't in JSON but hardcoded here
   */
  createProjectileSprite = async (
    spriteName: string,
    direction: Direction,
    paletteSwaps: PaletteSwaps
  ) => {
    const filename = `${spriteName}/${spriteName}_${direction}_1`;
    const offsets = (() => {
      switch (spriteName) {
        case 'arrow':
          return { dx: 0, dy: -8 };
        case 'bolt':
        default:
          return { dx: 0, dy: -0 };
      }
    })();
    const image = await this.imageFactory.getImage({
      filename,
      paletteSwaps,
      transparentColor: Color.WHITE
    });
    return new StaticSprite(image, offsets);
  };

  /**
   * TODO - hardcoded
   */
  createDoorSprite = async (): Promise<DynamicSprite<Door>> => {
    const spriteName = 'door';
    const offsets = { dx: 0, dy: -24 };
    // TODO hardcoded
    const paletteSwaps = PaletteSwaps.builder()
      // DARK_RED -> YELLOW_CGA
      .addMapping(Color.fromHex('#800000'), Color.fromHex('#ffff55'))
      // DARK_BROWN -> LIGHT_MAGENTA_CGA
      .addMapping(Color.fromHex('#804000'), Color.fromHex('#ff55ff'))
      .build();
    const imageMap: Record<string, Image> = {};
    for (const direction of [DoorDirection.HORIZONTAL, DoorDirection.VERTICAL]) {
      for (const state of DoorState.values()) {
        const key = `${direction.toLowerCase()}_${state.toLowerCase()}`;
        const filename = `${spriteName}_${direction.toLowerCase()}_${state.toLowerCase()}`;
        const image = await this.imageFactory.getImage({
          filename,
          paletteSwaps,
          transparentColor: Color.WHITE
        });
        imageMap[key] = image;
      }
    }
    return new DoorSprite({ spriteName, offsets, imageMap });
  };

  createMirrorSprite = async (): Promise<DynamicSprite<Spawner>> => {
    const imageMap: Record<string, Image> = {};
    for (const state of SpawnerState.values()) {
      const key = `${state.toLowerCase()}`;
      const filename: string = (() => {
        switch (state) {
          case SpawnerState.ALIVE:
            return 'mirror';
          case SpawnerState.DEAD:
            return 'mirror_broken';
          default:
            throw new Error(`Unknown mirror state ${state}`);
        }
      })();

      const image = await this.imageFactory.getImage({
        filename,
        transparentColor: Color.WHITE
      });
      imageMap[key] = image;
    }

    const offsets = { dx: -4, dy: -20 };
    return new SpawnerSprite({ spriteName: 'mirror', offsets, imageMap });
  };

  createShrineSprite = async (): Promise<DynamicSprite<Shrine>> => {
    const imageMap: Record<string, Image> = {};
    const image = await this.imageFactory.getImage({
      filename: 'shrine',
      transparentColor: Color.WHITE
    });
    imageMap['shrine'] = image;
    const depletedImage = await this.imageFactory.getImage({
      filename: 'shrine',
      transparentColor: Color.WHITE,
      paletteSwaps: PaletteSwaps.builder()
        // RED -> GRAY_192
        .addMapping(Color.fromHex('#ff0000'), Color.fromHex('#c0c0c0'))
        // DARK_RED -> GRAY_128
        .addMapping(Color.fromHex('#800000'), Color.fromHex('#808080'))
        .build()
    });
    imageMap['shrine_depleted'] = depletedImage;
    return new ShrineSprite({ imageMap });
  };

  private _loadAnimations = async (
    spriteCategory: SpriteCategory,
    spriteModel: DynamicSpriteModel,
    paletteSwaps: PaletteSwaps
  ): Promise<Record<string, Image>> => {
    const imageMap: Record<string, Image> = {};

    for (const [animationName, animation] of Object.entries(spriteModel.animations)) {
      for (const direction of Direction.values()) {
        for (let i = 1; i <= animation.frames.length; i++) {
          // 1-indexed
          const frame = animation.frames[i - 1];
          const variables = {
            sprite: spriteModel.id,
            activity: frame.activity,
            direction: Direction.toLegacyDirection(direction),
            number: frame.number
          };

          const patterns = animation.pattern
            ? [animation.pattern]
            : spriteModel.patterns
              ? spriteModel.patterns
              : spriteModel.pattern
                ? [spriteModel.pattern]
                : [];

          const filenames = patterns
            .map(pattern => `${spriteCategory}/${spriteModel.id}/${pattern}`)
            .map(pattern => fillTemplate(pattern, variables));

          // TODO - can we get this into the sprite model?
          const effects: ImageEffect[] = [];
          switch (animationName) {
            case 'damaged':
              effects.push(ImageEffects.DAMAGED);
              break;
            case 'burning':
              effects.push(ImageEffects.BURNING);
              break;
            case 'frozen':
              effects.push(ImageEffects.FROZEN);
              break;
            case 'shocked':
              effects.push(ImageEffects.SHOCKED);
              break;
          }

          const frameKey = `${animationName}_${direction}_${i}`;
          const image = await this.imageFactory.getImage({
            filenames,
            transparentColor: Color.WHITE,
            paletteSwaps,
            effects
          });
          imageMap[frameKey] = image;
        }
      }
    }

    return imageMap;
  };
}
