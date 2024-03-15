import Colors from './Colors';
import { FontBundle, FontInstance, FontName } from './Fonts';
import { PaletteSwaps } from '@lib/graphics/PaletteSwaps';
import { createCanvas, getCanvasContext } from '@lib/utils/dom';
import { GameConfig } from '@main/core/GameConfig';
import { Image } from '@lib/graphics/images/Image';
import { replaceColors } from '@lib/graphics/images/ImageUtils';
import { Color } from '@lib/graphics/Color';
import { inject, injectable } from 'inversify';

@injectable()
export class TextRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly imageCache: Record<string, Image> = {};

  constructor(
    @inject(GameConfig)
    gameConfig: GameConfig,
    @inject(FontBundle)
    private readonly fonts: FontBundle
  ) {
    this.canvas = createCanvas({
      width: gameConfig.screenWidth,
      height: gameConfig.screenHeight,
      offscreen: true
    });
    this.context = getCanvasContext(this.canvas);
  }

  renderText = async (text: string, fontName: FontName, color: Color): Promise<Image> => {
    const font = this.fonts.getFont(fontName);
    const key = _getCacheKey(text, font, color);
    if (this.imageCache[key]) {
      return this.imageCache[key];
    }

    const width = text.length * font.letterWidth;
    const height = font.letterHeight;

    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const letterData = font.renderCharacter(char);
      this.context.putImageData(letterData, font.letterWidth * i, 0);
    }

    const imageData = this.context.getImageData(0, 0, width, height);

    const paletteSwaps = PaletteSwaps.builder().addMapping(Colors.BLACK, color).build();
    const swapped = replaceColors(imageData, paletteSwaps);
    const image = await Image.create({ imageData: swapped });

    this.imageCache[key] = image;
    return image;
  };
}

const _getCacheKey = (text: string, font: FontInstance, color: Color): string => {
  return `${font.name}_${color.hex}_${text}`;
};
