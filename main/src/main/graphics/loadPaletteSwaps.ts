import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { AssetBundle } from '@duzh/assets';
import { checkNotNull } from '@duzh/utils/preconditions';
import { Color } from '@lib/graphics/Color';

/**
 * @param paletteSwaps Contains a map of color names, to be converted to hex format
 */
export const loadPaletteSwaps = (
  paletteSwaps: Record<string, string> | undefined,
  assetBundle: AssetBundle
): PaletteSwaps => {
  const builder = PaletteSwaps.builder();
  if (paletteSwaps) {
    for (const [srcName, destName] of Object.entries(paletteSwaps)) {
      const srcColor = Color.fromHex(checkNotNull(assetBundle.colors[srcName]));
      const destColor = Color.fromHex(checkNotNull(assetBundle.colors[destName]));
      builder.addMapping(srcColor, destColor);
    }
  }
  return builder.build();
};
