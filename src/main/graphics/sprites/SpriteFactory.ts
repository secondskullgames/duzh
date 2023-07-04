import Equipment from '../../equipment/Equipment';
import Door, { DoorState } from '../../entities/objects/Door';
import Spawner, { SpawnerState } from '../../entities/objects/Spawner';
import Direction from '../../geometry/Direction';
import { loadDynamicSpriteModel, loadStaticSpriteModel } from '../../utils/models';
import Colors from '../Colors';
import { Image } from '../images/Image';
import { ImageEffect } from '../images/ImageEffect';
import PaletteSwaps from '../PaletteSwaps';
import Unit from '../../entities/units/Unit';
import { fillTemplate } from '../../utils/templates';
import DynamicSprite from './DynamicSprite';
import Sprite from './Sprite';
import { SpriteCategory } from './SpriteCategory';
import StaticSprite from './StaticSprite';
import type DynamicSpriteModel from '../../schemas/DynamicSpriteModel';
import { GlobalContext } from '../../core/GlobalContext';

/**
 * Tiles don't use JSON models and are assumed to use baseline parameters (white = transparent, offsets = (0, 0))
 */
const createTileSprite = async (
  filename: string,
  paletteSwaps: PaletteSwaps,
  context: GlobalContext
): Promise<Sprite> => {
  const offsets = { dx: 0, dy: 0 };
  const transparentColor = Colors.WHITE;
  const image = await context.imageFactory.getImage({
    filename: `tiles/${filename}`,
    paletteSwaps,
    transparentColor
  });
  return new StaticSprite(image, offsets);
};

/**
 * TODO palette swaps should be part of the JSON, not a parameter here
 */
const createStaticSprite = async (
  spriteName: string,
  paletteSwaps: PaletteSwaps,
  context: GlobalContext
): Promise<Sprite> => {
  const model = await loadStaticSpriteModel(spriteName);
  const { filename, offsets, transparentColor } = model;
  const image = await context.imageFactory.getImage({
    filename,
    paletteSwaps,
    transparentColor: (transparentColor) ? Colors[transparentColor] : null
  });
  return new StaticSprite(image, offsets);
};

const createUnitSprite = async (
  spriteName: string,
  paletteSwaps: PaletteSwaps,
  context: GlobalContext
): Promise<DynamicSprite<Unit>> => {
  const model = await loadDynamicSpriteModel(spriteName, SpriteCategory.UNITS);
  const imageMap = await _loadAnimations(SpriteCategory.UNITS, model, paletteSwaps, context);

  return new DynamicSprite<Unit>({
    paletteSwaps,
    imageMap,
    offsets: model.offsets
  });
};

const createEquipmentSprite = async (spriteName: string, paletteSwaps: PaletteSwaps, context: GlobalContext) => {
  const model = await loadDynamicSpriteModel(spriteName, SpriteCategory.EQUIPMENT);
  const imageMap = await _loadAnimations(SpriteCategory.EQUIPMENT, model, paletteSwaps, context);

  return new DynamicSprite<Equipment>({
    paletteSwaps,
    imageMap,
    offsets: model.offsets
  });
};

/**
 * TODO - these aren't in JSON but hardcoded here
 */
const createProjectileSprite = async (spriteName: string, direction: Direction, paletteSwaps: PaletteSwaps, context: GlobalContext) => {
  const filename = `${spriteName}/${spriteName}_${Direction.toString(direction)}_1`;
  const offsets = (() => {
    switch (spriteName) {
      case 'arrow':
        return { dx: 0, dy: -8 };
      case 'bolt':
      default:
        return { dx: 0, dy: -0 };
    }
  })();
  const image = await context.imageFactory.getImage({
    filename,
    paletteSwaps,
    transparentColor: Colors.WHITE
  });
  return new StaticSprite(image, offsets);
};

/**
 * TODO - hardcoded
 */
const createDoorSprite = async (context: GlobalContext): Promise<DynamicSprite<Door>> => {
  const offsets = { dx: 0, dy: -24 };
  // TODO hardcoded
  const paletteSwaps = PaletteSwaps.builder()
    .addMapping(Colors.DARK_RED, Colors.YELLOW_CGA)
    .addMapping(Colors.DARK_BROWN, Colors.LIGHT_MAGENTA_CGA)
    .addMapping(Colors.BLACK, Colors.BLACK_CGA)
    .build();
  const imageMap: Record<string, Image> = {};
  for (const direction of ['horizontal', 'vertical']) {
    for (const state of DoorState.values()) {
      const key = `${direction.toLowerCase()}_${state.toLowerCase()}`;
      const filename = `door_${direction.toLowerCase()}_${state.toLowerCase()}`;
      const image = await context.imageFactory.getImage({
        filename,
        paletteSwaps,
        transparentColor: Colors.WHITE
      });
      imageMap[key] = image;
    }
  }
  return new DynamicSprite<Door>({
    offsets,
    paletteSwaps,
    imageMap
  });
};

const createMirrorSprite = async (context: GlobalContext): Promise<DynamicSprite<Spawner>> => {
  const imageMap: Record<string, Image> = {};
  for (const state of SpawnerState.values()) {
    const key = `${state.toLowerCase()}`;
    const filename: string = (() => {
      switch (state) {
        case 'ALIVE': return 'mirror';
        case 'DEAD':  return 'mirror_broken';
        default:      throw new Error(`Unknown mirror state ${state}`);
      }
    })();

    const image = await context.imageFactory.getImage({
      filename,
      transparentColor: Colors.WHITE
    });
    imageMap[key] = image;
  }

  const offsets = { dx: -4, dy: -20 };
  return new DynamicSprite<Spawner>({
    offsets,
    imageMap
  });
};

const _loadAnimations = async (
  spriteCategory: SpriteCategory,
  spriteModel: DynamicSpriteModel,
  paletteSwaps: PaletteSwaps,
  context: GlobalContext
): Promise<Record<string, Image>> => {
  const imageMap: Record<string, Image> = {};

  for (const [animationName, animation] of Object.entries(spriteModel.animations)) {
    for (const direction of Direction.values()) {
      for (let i = 1; i <= animation.frames.length; i++) { // 1-indexed
        const frame = animation.frames[i - 1];
        const variables = {
          sprite: spriteModel.name,
          activity: frame.activity,
          direction: Direction.toLegacyDirection(direction),
          number: frame.number
        };

        const patterns = animation.pattern ? [animation.pattern]
          : spriteModel.patterns ? spriteModel.patterns
          : spriteModel.pattern ? [spriteModel.pattern]
          : [];

        const filenames = patterns.map(pattern => `${spriteCategory}/${spriteModel.name}/${pattern}`)
          .map(pattern => fillTemplate(pattern, variables));

        // TODO - can we get this into the sprite model?
        const effects: ImageEffect[] = [];
        switch(animationName) {
          case 'damaged':
            effects.push(ImageEffect.DAMAGED);
            break;
          case 'burned':
            effects.push(ImageEffect.BURNED);
            break;
        }

        const frameKey = `${animationName}_${Direction.toString(direction)}_${i}`;
        const image = await context.imageFactory.getImage({
          filenames,
          transparentColor: Colors.WHITE,
          paletteSwaps,
          effects
        });
        imageMap[frameKey] = image;
      }
    }
  }

  return imageMap;
};

export default {
  createTileSprite,
  createStaticSprite,
  createUnitSprite,
  createEquipmentSprite,
  createProjectileSprite,
  createDoorSprite,
  createMirrorSprite,
};