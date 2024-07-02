import { Renderer } from '@main/graphics/renderers/Renderer';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Graphics } from '@lib/graphics/Graphics';
import { Rect } from '@lib/geometry/Rect';
import { GameConfig } from '@main/core/GameConfig';
import { inject, injectable } from 'inversify';

export enum TopMenuIcon {
  MAP = 'MAP',
  INVENTORY = 'INVENTORY',
  CHARACTER = 'CHARACTER'
}

export type TopMenuIconWithRect = Readonly<{
  icon: TopMenuIcon;
  filename: string;
  rect: Rect;
}>;

@injectable()
export default class TopMenuRenderer implements Renderer {
  constructor(
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(GameConfig)
    private readonly gameConfig: GameConfig
  ) {}

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    const iconRects = TopMenuRenderer.getIconRects();
    for (let i = 0; i < iconRects.length; i++) {
      const { filename, rect } = iconRects[i];
      const image = await this.imageFactory.getImage({
        filename
      });
      graphics.drawImage(image, Rect.getTopLeft(rect));
    }
  };

  static getIconRects = (): TopMenuIconWithRect[] => {
    const icons = [TopMenuIcon.MAP, TopMenuIcon.INVENTORY, TopMenuIcon.CHARACTER];
    const iconsWithRects: TopMenuIconWithRect[] = [];
    const screenWidth = 640; // TODO this sucks
    for (let i = 0; i < icons.length; i++) {
      const rect = {
        left: screenWidth - 25 - 25 * icons.length + 25 * i,
        top: 2,
        width: 20,
        height: 20
      };
      const icon = icons[i];
      const filename = (() => {
        switch (icon) {
          case TopMenuIcon.MAP:
            return 'menu/map_icon';
          case TopMenuIcon.CHARACTER:
            return 'menu/char_icon';
          case TopMenuIcon.INVENTORY:
            return 'menu/inv_icon';
        }
      })();
      iconsWithRects.push({ icon, filename, rect });
    }
    return iconsWithRects;
  };
}
