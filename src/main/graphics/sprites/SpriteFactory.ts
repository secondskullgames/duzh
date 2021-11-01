import Color from '../../types/Color';
import Direction from '../../types/Direction';
import PaletteSwaps from '../../types/PaletteSwaps';
import { Activity } from '../../types/types';
import { fillTemplate } from '../../utils/TemplateUtils';
import ImageBuilder from '../ImageBuilder';
import { replaceAll } from '../ImageUtils';
import DynamicSprite from './DynamicSprite';
import Sprite from './Sprite';
import Unit from '../../units/Unit';
import DynamicSpriteModel from './DynamicSpriteModel';
import StaticSprite from './StaticSprite';
import StaticSpriteModel from './StaticSpriteModel';
import Equipment from '../../items/equipment/Equipment';

type SpriteCategory = 'units' | 'equipment' | 'static';

const createStaticSprite = async (filename: string, paletteSwaps: PaletteSwaps): Promise<Sprite> => {
  const model: StaticSpriteModel = await loadSpriteModel(filename, 'static');
  const { offsets, transparentColor } = model;
  const image = await new ImageBuilder({
    filename,
    paletteSwaps,
    transparentColor
  }).build();
  return new StaticSprite(image, offsets);
};

const createUnitSprite = async (spriteName: string, unit: Unit, paletteSwaps: PaletteSwaps={}): Promise<Sprite> => {
  const spriteModel: DynamicSpriteModel = await loadSpriteModel(spriteName, 'units');
  const imageMap = await loadAnimations(spriteModel, paletteSwaps);
  const keyFunction = (unit: Unit) => `${unit.activity}_${unit.direction}`;
  return new DynamicSprite<Unit>({
    target: unit,
    paletteSwaps,
    imageMap,
    offsets:
    spriteModel.offsets,
    keyFunction
  });
};

const createEquipmentSprite = async (spriteName: string, equipment: Equipment, paletteSwaps: PaletteSwaps={}) => {
  const spriteModel: DynamicSpriteModel = await loadSpriteModel(spriteName, 'equipment');
  const imageMap = await loadAnimations(spriteModel, paletteSwaps);
  const keyFunction = (equipment: Equipment) => `${equipment.unit!!.activity}_${equipment.unit!!.direction}`;
  return new DynamicSprite<Equipment>({
    target: equipment,
    paletteSwaps,
    imageMap,
    offsets:
    spriteModel.offsets,
    keyFunction
  });
};

/**
 * TODO - these aren't in JSON but hardcoded here
 */
const createProjectileSprite = async (spriteName: string, direction: Direction, paletteSwaps: PaletteSwaps={}) => {
  const filename = `${spriteName}/${spriteName}_${direction}_1`;
  const offsets = { dx: 0, dy: -8 };
  const image = await new ImageBuilder({
    filename,
    paletteSwaps,
    transparentColor: Color.WHITE
  }).build();
  return new StaticSprite(image, offsets);
};

const loadAnimations = async (spriteModel: DynamicSpriteModel, paletteSwaps: PaletteSwaps): Promise<Record<string, ImageBitmap>> => {
  const imageMap: Record<string, ImageBitmap> = {};
  for (const [animationName, animation] of Object.entries(spriteModel.animations)) {
    for (const frame of animation.frames) {
      for (const direction of Direction.values()) {
        const variables = {
          sprite: spriteModel.name,
          activity: animationName,
          direction,
          number: frame.number
        };

        const patterns = animation.pattern ? [animation.pattern]
          : spriteModel.patterns ? spriteModel.patterns
          : spriteModel.pattern ? [spriteModel.pattern]
          : [];

        const filenames = patterns.map(pattern => `units/${spriteModel.name}/${pattern}`)
          .map(pattern => fillTemplate(pattern, variables));

        const effects = (animationName === Activity.DAMAGED.toString())
          ? [(img: ImageData) => replaceAll(img, Color.WHITE)]
          : [];

        const image: ImageBitmap = await new ImageBuilder({
          filenames,
          transparentColor: Color.WHITE,
          paletteSwaps,
          effects
        }).build();

        const frameKey = `${animationName}_${direction}`;
        imageMap[frameKey] = image;
      }
    }
  }
  return imageMap;
};

const loadSpriteModel = async <T> (name: string, category: SpriteCategory): Promise<T> => {
  return (await import(`../../../../data/sprites/${category}/${name}.json`)).default;
};

// the following does not work: { ...StaticSprites, ...UnitSprites }
// :(
export default {
  createStaticSprite,
  createUnitSprite,
  createEquipmentSprite,
  createProjectileSprite
};
