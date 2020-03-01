import ImageSupplier from '../ImageSupplier';
import { PaletteSwaps } from '../../types/types';
import Colors from '../../types/Colors';
import { replaceAll } from '../ImageUtils';

/**
 * Naming is hard, good thing this isn't being exported... :<
 */
type ImageSupplierSupplier = (paletteSwaps: PaletteSwaps) => ImageSupplier;

interface SpriteClass {
  name: string;
  imageMap: { [key: string]: ImageSupplierSupplier };
}

const SpriteClasses: { [name: string]: SpriteClass } = {
  PLAYER: {
    name: 'PLAYER',
    imageMap: {
      STANDING: paletteSwaps => new ImageSupplier('player_standing_SE_1', Colors.WHITE, paletteSwaps),
      STANDING_DAMAGED: paletteSwaps => new ImageSupplier('player_standing_SE_1', Colors.WHITE, paletteSwaps, [img => replaceAll(img, Colors.WHITE)])
    }
  }
};
