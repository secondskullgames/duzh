import { Color, FontBundle, FontInstance, Graphics, PaletteSwaps } from '@duzh/graphics';
import { replaceColors } from '@duzh/graphics/images';
import { createCanvas } from '@main/utils/dom';
import { GameConfig } from '@main/core/GameConfig';
import { InterfaceColors } from '@main/graphics/InterfaceColors';
import { FontName } from './Fonts';

export type TextParams = Readonly<{
  text: string;
  fontName: FontName;
  color: Color;
  backgroundColor: Color;
}>;

export class TextRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly imageCache: Record<string, ImageData> = {};
  private readonly graphics: Graphics;

  constructor(
    gameConfig: GameConfig,
    private readonly fonts: FontBundle
  ) {
    this.canvas = createCanvas({
      width: gameConfig.screenWidth,
      height: gameConfig.screenHeight,
      offscreen: true
    });
    this.graphics = Graphics.forCanvas(this.canvas);
  }

  renderText = ({ text, fontName, color, backgroundColor }: TextParams): ImageData => {
    const font = this.fonts.getFont(fontName);
    const key = _getCacheKey(text, font, color);
    if (this.imageCache[key]) {
      return this.imageCache[key];
    }

    const width = text.length * font.letterWidth;
    const height = font.letterHeight;
    this.graphics.fill(InterfaceColors.WHITE);

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const letterData = font.renderCharacter(char);
      this.graphics.putImageData(letterData, { x: font.letterWidth * i, y: 0 });
    }

    const imageData = this.graphics.getImageData({ left: 0, top: 0, width, height });

    const paletteSwaps = PaletteSwaps.builder()
      .addMapping(InterfaceColors.BLACK, color)
      .addMapping(InterfaceColors.WHITE, backgroundColor)
      .build();
    const swapped = replaceColors(imageData, paletteSwaps);

    this.imageCache[key] = swapped;
    return swapped;
  };
}

const _getCacheKey = (text: string, font: FontInstance, color: Color): string => {
  return `${font.name}_${color.hex}_${text}`;
};
