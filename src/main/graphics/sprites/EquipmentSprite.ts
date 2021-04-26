import ImageSupplier from '../ImageSupplier';
import Sprite, { Offsets } from './Sprite';
import Colors from '../../types/Colors';
import { Activity, PaletteSwaps } from '../../types/types';
import { fillTemplate } from '../../utils/TemplateUtils';
import { replaceAll } from '../ImageUtils';
import Directions from '../../types/Directions';
import Equipment from '../../items/equipment/Equipment';

class EquipmentSprite extends Sprite {
  private _equipment: Equipment;
  private readonly _spriteName: string;
  private static readonly TEMPLATE = 'equipment/${sprite}/${sprite}_${activity}_${direction}_${number}';
  private static readonly BEHIND_TEMPLATE = 'equipment/${sprite}/${sprite}_${activity}_${direction}_${number}_B';
  private readonly _paletteSwaps: PaletteSwaps;

  constructor(equipment: Equipment, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: Offsets) {
    super(spriteOffsets);
    this._equipment = equipment;
    this._spriteName = spriteName;
    this._paletteSwaps = paletteSwaps;
  }

  /**
   * NOTE: This is mostly copy-pasted from {@link UnitSprite#getImage}
   *
   * @override {@link Sprite#getImage}
   */
  getImage(): Promise<ImageBitmap> {
    const unit = this._equipment.unit!!;
    const variables = {
      sprite: this._spriteName,
      activity: _activityToString(unit.activity),
      direction: Directions.toLegacyDirection(unit.direction!!),
      number: 1
    };
    const filename = fillTemplate(EquipmentSprite.TEMPLATE, variables);
    const behindFilename = fillTemplate(EquipmentSprite.BEHIND_TEMPLATE, variables);
    // TODO can we get this into the yaml?
    const effects = (unit.activity === Activity.DAMAGED)
      ? [(img: ImageData) => replaceAll(img, Colors.WHITE)]
      : [];
    console.log('in getImage()');
    return new ImageSupplier([behindFilename, filename], Colors.WHITE, this._paletteSwaps, effects).get();
  }
}

function _activityToString(activity: Activity): string {
  return (activity === 'DAMAGED' ? Activity.STANDING : activity).toLowerCase();
}

export default EquipmentSprite;