import ImageSupplier from '../ImageSupplier';
import Sprite from './Sprite';
import Colors from '../../types/Colors';
import Unit from '../../units/Unit';
import Directions from '../../types/Directions';
import { PaletteSwaps } from '../../types/types';
import { replaceAll } from '../ImageUtils';

enum SpriteKey {
  STANDING_N = 'STANDING_N',
  STANDING_E = 'STANDING_E',
  STANDING_S = 'STANDING_S',
  STANDING_W = 'STANDING_W',
  DAMAGED_N = 'DAMAGED_N',
  DAMAGED_E = 'DAMAGED_E',
  DAMAGED_S = 'DAMAGED_S',
  DAMAGED_W = 'DAMAGED_W',
}

abstract class UnitSprite extends Sprite {
  private _unit: Unit;

  protected constructor(unit: Unit, spriteName: string, paletteSwaps: PaletteSwaps, spriteOffsets: { dx: number, dy: number }) {
    const imageMap = {
      [SpriteKey.STANDING_N]: new ImageSupplier(`${spriteName}_standing_N_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.STANDING_E]: new ImageSupplier(`${spriteName}_standing_E_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.STANDING_S]: new ImageSupplier(`${spriteName}_standing_S_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.STANDING_W]: new ImageSupplier(`${spriteName}_standing_W_1`, Colors.WHITE, paletteSwaps),
      [SpriteKey.DAMAGED_N]: new ImageSupplier(`${spriteName}_standing_N_1`, Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)]),
      [SpriteKey.DAMAGED_E]: new ImageSupplier(`${spriteName}_standing_E_1`, Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)]),
      [SpriteKey.DAMAGED_S]: new ImageSupplier(`${spriteName}_standing_S_1`, Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)]),
      [SpriteKey.DAMAGED_W]: new ImageSupplier(`${spriteName}_standing_W_1`, Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)])
    };
    super(imageMap, SpriteKey.STANDING_S, spriteOffsets);
    this._unit = unit;
  }

  update(): Promise<any> {
    this.key = this._getKey();
    return this.getImage();
  }

  private _getKey(): SpriteKey {
    const direction = this._unit.direction || Directions.S;
    const key = `${this._unit.activity}_${Directions.toString(direction)}`;
    return <SpriteKey>key;
  }
}

export default UnitSprite;