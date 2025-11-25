import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { AssetBundle } from '@main/assets/AssetBundle';

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
      const srcColor = assetBundle.colorForName(srcName);
      const destColor = assetBundle.colorForName(destName);
      builder.addMapping(srcColor, destColor);
    }
  }
  return builder.build();
};
