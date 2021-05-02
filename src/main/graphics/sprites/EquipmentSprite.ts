import ImageSupplier from '../ImageSupplier';
import Sprite, { Offsets } from './Sprite';
import Colors from '../../types/Colors';
import { Activity, PaletteSwaps } from '../../types/types';
import { fillTemplate } from '../../utils/TemplateUtils';
import { replaceAll } from '../ImageUtils';
import Directions from '../../types/Directions';
import Equipment from '../../items/equipment/Equipment';
import type { SpriteConfig } from './SpriteConfig';

function _memoize<V>(key: string, valueSupplier: (k: string) => V, cache: { [k: string]: V }): V {
  if (cache[key]) {
    return cache[key];
  }

  const value = valueSupplier(key);
  cache[key] = value;
  return value;
}

class EquipmentSprite extends Sprite {
  private _equipment: Equipment;
  private readonly _spriteConfig: SpriteConfig;
  private readonly _paletteSwaps: PaletteSwaps;
  private readonly _imageCache: { [key: string]: Promise<ImageBitmap> };

  constructor(equipment: Equipment, spriteConfig: SpriteConfig, paletteSwaps: PaletteSwaps, spriteOffsets: Offsets) {
    super(spriteOffsets);
    this._equipment = equipment;
    this._spriteConfig = spriteConfig;
    this._paletteSwaps = paletteSwaps;
    this._imageCache = {};
  }

  /**
   * NOTE: This is mostly copy-pasted from {@link UnitSprite#getImage}
   *
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap | null> {
    const unit = this._equipment.unit!!;
    const activity = unit.activity.toLowerCase();
    const direction = Directions.toLegacyDirection(unit.direction!!);
    return _memoize(`${activity}_${direction}`, () => this._getImage(), this._imageCache);
  }

  _getImage(): Promise<ImageBitmap | null> {
    const unit = this._equipment.unit!!;
    const spriteConfig = this._spriteConfig;

    let activity = unit.activity.toLowerCase();
    const direction = Directions.toLegacyDirection(unit.direction!!);
    const animation = spriteConfig.animations[activity];
    if (!animation) {
      return Promise.resolve(null);
    }
    const frame = animation.frames[0];
    activity = frame.activity || activity;

    const variables = {
      sprite: spriteConfig.name,
      activity,
      direction,
      number: animation.frames[0].number
    };

    const patterns = spriteConfig.patterns || [spriteConfig.pattern!!];
    const filenames = patterns.map(pattern => `equipment/${spriteConfig.name}/${pattern}`)
      .map(pattern => fillTemplate(pattern, variables));
    const effects = (unit.activity === Activity.DAMAGED)
      ? [(img: ImageData) => replaceAll(img, Colors.WHITE)]
      : [];
    return new ImageSupplier(filenames, Colors.WHITE, this._paletteSwaps, effects).get();
  }
}

export default EquipmentSprite;