import ImageSupplier from '../../ImageSupplier';
import Sprite from '../Sprite';
import Colors from '../../../types/Colors';
import Unit from '../../../units/Unit';
import { Activity, PaletteSwaps } from '../../../types/types';
import { fillTemplate } from '../../../utils/TemplateUtils';
import { replaceAll } from '../../ImageUtils';
import Directions from '../../../types/Directions';

class UnitSprite extends Sprite {
  private _unit: Unit;
  private readonly _spriteName: string;
  private readonly _template = '${sprite}/${sprite}_${activity}_${direction}_${number}';
  private readonly _paletteSwaps: PaletteSwaps;

  protected constructor(unit: Unit, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: { dx: number, dy: number }) {
    super(spriteOffsets);
    this._unit = unit;
    this._spriteName = spriteName;
    this._paletteSwaps = paletteSwaps;
  }

  /**
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    const variables = {
      sprite: this._spriteName,
      activity: (this._unit.activity === 'DAMAGED' ? Activity.STANDING : this._unit.activity).toLowerCase(),
      direction: Directions.toString(this._unit.direction!!),
      number: 1
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