import Equipment from '../../equipment/Equipment';
import Door, { DoorDirection, DoorState } from '../../objects/Door';
import Spawner, { SpawnerState } from '../../objects/Spawner';
import Direction from '../../geometry/Direction';
import Color from '../Color';
import Colors from '../Colors';
import Image from '../images/Image';
import ImageEffect from '../images/ImageEffect';
import PaletteSwaps from '../PaletteSwaps';
import Unit from '../../units/Unit';
import { fillTemplate } from '../../utils/templates';
import ImageFactory from '../images/ImageFactory';
import DynamicSprite from './DynamicSprite';
import DynamicSpriteModel from './DynamicSpriteModel';
import Sprite from './Sprite';
import StaticSprite from './StaticSprite';
import StaticSpriteModel from './StaticSpriteModel';

type SpriteCategory = 'units' | 'equipment' | 'static';

/**
 * Tiles don't use JSON models and are assumed to use baseline parameters (white = transparent, offsets = (0, 0))
 */
const createTileSprite = async (filename: string, paletteSwaps?: PaletteSwaps): Promise<Sprite> => {
  const offsets = { dx: 0, dy: 0 };
  const transparentColor = Colors.WHITE;
  const image = await ImageFactory.getImage({
    filename: `tiles/${filename}`,
    paletteSwaps,
    transparentColor
  });
  return new StaticSprite(image, offsets);
};

const createStaticSprite = async (spriteName: string, paletteSwaps?: PaletteSwaps): Promise<Sprite> => {
  const model: StaticSpriteModel = await loadSpriteModel(spriteName, 'static');
  const { offsets, transparentColor } = model;
  const image = await ImageFactory.getImage({
    filename: model.filename,
    paletteSwaps,
    transparentColor
  });
  return new StaticSprite(image, offsets);
};

const createUnitSprite = async (spriteName: string, paletteSwaps?: PaletteSwaps): Promise<DynamicSprite<Unit>> => {
  const spriteModel: DynamicSpriteModel = await loadSpriteModel(spriteName, 'units');
  const imageMap = _loadAnimations('units', spriteModel, paletteSwaps);

  return new DynamicSprite<Unit>({
    paletteSwaps,
    imageMap,
    offsets:
    spriteModel.offsets
  });
};

const createEquipmentSprite = async (spriteName: string, paletteSwaps?: PaletteSwaps) => {
  const spriteModel: DynamicSpriteModel = await loadSpriteModel(spriteName, 'equipment');
  const imageMap = _loadAnimations('equipment', spriteModel, paletteSwaps);

  return new DynamicSprite<Equipment>({
    paletteSwaps,
    imageMap,
    offsets:
    spriteModel.offsets
  });
};

/**
 * TODO - these aren't in JSON but hardcoded here
 */
const createProjectileSprite = async (spriteName: string, direction: Direction, paletteSwaps?: PaletteSwaps) => {
  const filename = `${spriteName}/${spriteName}_${Direction.toString(direction)}_1`;
  const offsets = { dx: 0, dy: -8 };
  const image = await ImageFactory.getImage({
    filename,
    paletteSwaps,
    transparentColor: Colors.WHITE
  });
  return new StaticSprite(image, offsets);
};

/**
 * TODO - hardcoded
 */
const createDoorSprite = async (): Promise<DynamicSprite<Door>> => {
  const offsets = { dx: 0, dy: -24 };
    // TODO hardcoded
  const paletteSwaps = PaletteSwaps.builder()
    .addMapping(Colors.DARK_RED, Colors.YELLOW_CGA)
    .addMapping(Colors.DARK_BROWN, Colors.LIGHT_MAGENTA_CGA)
    .addMapping(Colors.BLACK, Colors.BLACK_CGA)
    .build();
  const imageMap: Record<string, () => Promise<Image>> = {};
  for (const direction of DoorDirection.values()) {
    for (const state of DoorState.values()) {
      const key = `${direction.toLowerCase()}_${state.toLowerCase()}`;
      const filename = `door_${direction.toLowerCase()}_${state.toLowerCase()}`;
      const imageSupplier = () => ImageFactory.getImage({
        filename,
        paletteSwaps,
        transparentColor: Colors.WHITE
      });
      imageMap[key] = imageSupplier;
    }
  }
  return new DynamicSprite<Door>({
    offsets,
    paletteSwaps,
    imageMap
  });
};

const createMirrorSprite = async (): Promise<DynamicSprite<Spawner>> => {
  const imageMap: Record<string, () => Promise<Image>> = {};
  for (const state of SpawnerState.values()) {
    const key = `${state.toLowerCase()}`;
    const filename: string = (() => {
      switch (state) {
        case 'ALIVE': return 'mirror';
        case 'DEAD':  return 'mirror_broken';
      }
      throw new Error(); // wat
    })();
    const imageSupplier = () => ImageFactory.getImage({
      filename,
      transparentColor: Colors.WHITE
    });
    imageMap[key] = imageSupplier;
  }

  const offsets = { dx: -4, dy: -20 };
  return new DynamicSprite<Spawner>({
    offsets,
    imageMap
  });
};

const _loadAnimations = (
  spriteCategory: SpriteCategory,
  spriteModel: DynamicSpriteModel,
  paletteSwaps?: PaletteSwaps
): Record<string, () => Promise<Image>> => {
  const imageMap: Record<string, () => Promise<Image>> = {};

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
        const effects = (animationName === 'damaged')
          ? [ImageEffect.DAMAGED]
          : [];
        const frameKey = `${animationName}_${Direction.toString(direction)}_${i}`;

        const imageSupplier = () => ImageFactory.getImage({
          filenames,
          transparentColor: Colors.WHITE,
          paletteSwaps,
          effects
        });

        imageMap[frameKey] = imageSupplier;
      }
    }
  }

  return imageMap;
};

const loadSpriteModel = async <T> (name: string, category: SpriteCategory): Promise<T> => {
  const json = (await import(
    /* webpackMode: "eager" */
    `../../../../data/sprites/${category}/${name}.json`
  )).default;

  return {
    ...json,
    transparentColor: json.transparentColor && Color.fromHex(json.transparentColor)
  };
};

export default {
  createDoorSprite,
  createEquipmentSprite,
  createMirrorSprite,
  createProjectileSprite,
  createStaticSprite,
  createTileSprite,
  createUnitSprite
};
