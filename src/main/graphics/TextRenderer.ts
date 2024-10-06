import Colors from './Colors';
import { FontName } from './Fonts';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { createCanvas } from '@lib/utils/dom';
import { replaceColors } from '@lib/graphics/images/ImageUtils';
import { Color } from '@lib/graphics/Color';
import { FontInstance } from '@lib/graphics/Fonts';
import { Graphics } from '@lib/graphics/Graphics';
import { Globals } from '@main/core/globals';

export type TextParams = Readonly<{
  text: string;
  fontName: FontName;
  color: Color;
  backgroundColor: Color;
}>;

type Props = Readonly<{
  width: number;
  height: number;
}>;

export class TextRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly imageCache: Record<string, ImageData> = {};
  private readonly graphics: Graphics;

  constructor({ width, height }: Props) {
    this.canvas = createCanvas({ width, height });
    this.graphics = Graphics.forCanvas(this.canvas);
  }

  renderText = ({ text, fontName, color, backgroundColor }: TextParams): ImageData => {
    const { fontBundle } = Globals;
    const font = fontBundle.getFont(fontName);
    const key = _getCacheKey(text, font, color);
    if (this.imageCache[key]) {
      return this.imageCache[key];
    }

    const width = text.length * font.letterWidth;
    const height = font.letterHeight;
    this.graphics.fill(Colors.WHITE);

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const letterData = font.renderCharacter(char);
      this.graphics.putImageData(letterData, { x: font.letterWidth * i, y: 0 });
    }

    const imageData = this.graphics.getImageData({ left: 0, top: 0, width, height });

    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(Colors.BLACK, color)
      .addMapping(Colors.WHITE, backgroundColor)
      .build();
    const swapped = replaceColors(imageData, paletteSwaps);

    this.imageCache[key] = swapped;
    return swapped;
  };
}

const _getCacheKey = (text: string, font: FontInstance, color: Color): string => {
  return `${font.name}_${color.hex}_${text}`;
};
