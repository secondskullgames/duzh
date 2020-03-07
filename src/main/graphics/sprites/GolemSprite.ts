import ImageSupplier from '../ImageSupplier';
import { replaceAll } from '../ImageUtils';
import Sprite from './Sprite';
import { PaletteSwaps } from '../../types/types';
import Colors from '../../types/Colors';
import Unit from '../../units/Unit';
import Directions from '../../types/Directions';

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

class GolemSprite extends Sprite {
  private _unit: Unit;

  constructor(unit: Unit, paletteSwaps?: PaletteSwaps) {
    const imageMap = {
      [SpriteKey.STANDING_N]: new ImageSupplier('golem_standing_N_1', Colors.WHITE, paletteSwaps),
      [SpriteKey.STANDING_E]: new ImageSupplier('golem_standing_E_1', Colors.WHITE, paletteSwaps),
      [SpriteKey.STANDING_S]: new ImageSupplier('golem_standing_S_1', Colors.WHITE, paletteSwaps),
      [SpriteKey.STANDING_W]: new ImageSupplier('golem_standing_W_1', Colors.WHITE, paletteSwaps),
      [SpriteKey.DAMAGED_N]: new ImageSupplier('golem_standing_N_1', Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)]),
      [SpriteKey.DAMAGED_E]: new ImageSupplier('golem_standing_E_1', Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)]),
      [SpriteKey.DAMAGED_S]: new ImageSupplier('golem_standing_S_1', Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)]),
      [SpriteKey.DAMAGED_W]: new ImageSupplier('golem_standing_W_1', Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)])
    };
    super(imageMap, SpriteKey.STANDING_S, { dx: -4, dy: -20 });
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

export default GolemSprite;