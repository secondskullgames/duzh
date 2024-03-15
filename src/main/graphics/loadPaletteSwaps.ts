import Colors from '@main/graphics/Colors';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';

/**
 * @param paletteSwaps Contains a map of color names, to be converted to hex format
 */
export const loadPaletteSwaps = (paletteSwaps?: Record<string, string>): PaletteSwaps => {
  const builder = PaletteSwaps.builder();
  if (paletteSwaps) {
    for (const [srcName, destName] of Object.entries(paletteSwaps)) {
      const srcColor = Colors.colorForName(srcName);
      const destColor = Colors.colorForName(destName);
      builder.addMapping(srcColor, destColor);
    }
  }
  return builder.build();
};
