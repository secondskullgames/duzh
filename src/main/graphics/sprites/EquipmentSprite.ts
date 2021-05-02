import ImageSupplier from '../ImageSupplier';
import Sprite, { Offsets } from './Sprite';
import Colors from '../../types/Colors';
import { Activity, PaletteSwaps } from '../../types/types';
import { fillTemplate } from '../../utils/TemplateUtils';
import { replaceAll } from '../ImageUtils';
import Directions from '../../types/Directions';
import Equipment from '../../items/equipment/Equipment';
import type { SpriteConfig } from './SpriteConfig';

class EquipmentSprite extends Sprite {
  private _equipment: Equipment;
  private readonly _spriteConfig: SpriteConfig;
  private readonly _paletteSwaps: PaletteSwaps;

  constructor(equipment: Equipment, spriteConfig: SpriteConfig, paletteSwaps: PaletteSwaps, spriteOffsets: Offsets) {
    super(spriteOffsets);
    this._equipment = equipment;
    this._spriteConfig = spriteConfig;
    this._paletteSwaps = paletteSwaps;
  }

  /**
   * NOTE: This is mostly copy-pasted from {@link UnitSprite#getImage}
   *
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    const unit = this._equipment.unit!!;
    const spriteConfig = this._spriteConfig;

    let activity = unit.activity.toLowerCase();
    const direction = Directions.toLegacyDirection(unit.direction!!);
    const animation = spriteConfig.animations[activity];
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