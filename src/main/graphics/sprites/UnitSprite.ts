import ImageSupplier from '../ImageSupplier';
import Sprite from './Sprite';
import Colors from '../../types/Colors';
import Unit from '../../units/Unit';
import { Activity, PaletteSwaps } from '../../types/types';
import { fillTemplate } from '../../utils/TemplateUtils';
import { replaceAll } from '../ImageUtils';
import Directions from '../../types/Directions';
import { SpriteConfig } from './SpriteConfig';

class UnitSprite extends Sprite {
  private _unit: Unit;
  private readonly _spriteConfig: SpriteConfig;
  private readonly _template = 'units/${sprite}/${sprite}_${activity}_${direction}_${number}';
  private readonly _paletteSwaps: PaletteSwaps;

  constructor(unit: Unit, spriteConfig: SpriteConfig, paletteSwaps: PaletteSwaps, spriteOffsets: { dx: number, dy: number }) {
    super(spriteOffsets);
    this._unit = unit;
    this._spriteConfig = spriteConfig;
    this._paletteSwaps = paletteSwaps;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    let activity = this._unit.activity.toLowerCase();
    const direction = Directions.toLegacyDirection(this._unit.direction!!);
    const animation = this._spriteConfig.animations[activity];
    const frame = animation.frames[0];
    activity = frame.activity || activity;

    const variables = {
      sprite: this._spriteConfig.name,
      activity,
      direction,
      number: animation.frames[0].number
    };

    const filename = fillTemplate(this._template, variables);
    // TODO can we get this into the yaml?
    const effects = (this._unit.activity === Activity.DAMAGED)
      ? [(img: ImageData) => replaceAll(img, Colors.WHITE)]
      : [];
    return new ImageSupplier(filename, Colors.WHITE, this._paletteSwaps, effects).get();
  }
}

export default UnitSprite;