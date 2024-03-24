import { Renderer } from './Renderer';
import Colors from '../Colors';
import { LINE_HEIGHT } from '../constants';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import { FontName } from '../Fonts';
import { Pixel } from '@lib/geometry/Pixel';
import { Graphics } from '@lib/graphics/Graphics';
import { Session } from '@main/core/Session';
import { GameConfig } from '@main/core/GameConfig';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Color } from '@lib/graphics/Color';
import { getSlotName } from '@main/equipment/EquipmentUtils';
import { InventoryCategory } from '@main/core/session/InventoryState';
import { inject, injectable } from 'inversify';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_MARGIN = 10;

const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';

@injectable()
export default class InventoryRenderer implements Renderer {
  private readonly inventoryWidth: number;
  private readonly inventoryHeight: number;
  constructor(
    @inject(GameConfig)
    gameConfig: GameConfig,
    @inject(TextRenderer)
    private readonly textRenderer: TextRenderer,
    @inject(ImageFactory)
    private readonly imageFactory: ImageFactory,
    @inject(Session)
    private readonly session: Session
  ) {
    this.inventoryWidth = gameConfig.screenWidth;
    this.inventoryHeight = gameConfig.screenHeight;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    await this._drawBackground(graphics);
    await this._drawEquipment(graphics);
    await this._drawInventory(graphics);
    await this._drawTooltip(graphics);
  };

  private _drawText = async (
    text: string,
    font: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, graphics, pixel, textAlign);
  };

  private _drawBackground = async (graphics: Graphics) => {
    const { imageFactory } = this;
    graphics.clear();

    const image = await imageFactory.getImage({
      filename: INVENTORY_BACKGROUND_FILENAME
    });
    // TODO: need a 640x360 version of this image
    graphics.drawScaledImage(image, {
      left: INVENTORY_LEFT,
      top: INVENTORY_TOP,
      width: this.inventoryWidth,
      height: this.inventoryHeight
    });
  };

  private _drawEquipment = async (graphics: Graphics) => {
    const { session } = this;
    const inventory = session.getInventoryState();
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;

    await this._drawText(
      'EQUIPMENT',
      FontName.APPLE_II,
      { x: this.inventoryWidth / 4, y: INVENTORY_TOP + INVENTORY_MARGIN },
      inventory.getSelectedCategory() === InventoryCategory.EQUIPMENT
        ? Colors.YELLOW
        : Colors.WHITE,
      Alignment.CENTER,
      graphics
    );
    await this._drawText(
      'INVENTORY',
      FontName.APPLE_II,
      { x: (this.inventoryWidth * 3) / 4, y: INVENTORY_TOP + INVENTORY_MARGIN },
      inventory.getSelectedCategory() === InventoryCategory.ITEMS
        ? Colors.YELLOW
        : Colors.WHITE,
      Alignment.CENTER,
      graphics
    );

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    const playerUnit = session.getPlayerUnit();
    for (const equipment of playerUnit.getEquipment().getAll()) {
      const text = `${getSlotName(equipment.slot)} - ${equipment.getName()}`;
      await this._drawText(
        text,
        FontName.APPLE_II,
        { x: equipmentLeft, y },
        inventory.getSelectedEquipment() === equipment ? Colors.YELLOW : Colors.WHITE,
        Alignment.LEFT,
        graphics
      );
      y += LINE_HEIGHT;
    }
  };

  private _drawInventory = async (graphics: Graphics) => {
    const inventory = this.session.getInventoryState();
    const inventoryCategories = inventory.getItemCategories();
    const categoryWidth = 60;
    const xOffset = 4;
    const itemsLeft = (this.inventoryWidth + INVENTORY_MARGIN) / 2;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + categoryWidth / 2 + xOffset;
      const top = INVENTORY_TOP + 40;
      await this._drawText(
        inventoryCategories[i],
        FontName.APPLE_II,
        { x, y: top },
        Colors.WHITE,
        Alignment.CENTER,
        graphics
      );
      if (inventoryCategories[i] === inventory.getSelectedItemCategory()) {
        // TODO can we make a `drawLine`?
        const rect = {
          left: x - categoryWidth / 2 + 4,
          top: INVENTORY_TOP + 54,
          width: categoryWidth - 8,
          height: 1
        };
        graphics.fillRect(rect, Colors.WHITE);
      }
    }

    // draw inventory items
    const selectedItemCategory = inventory.getSelectedItemCategory();
    if (selectedItemCategory) {
      const items = inventory.getItems(
        this.session.getPlayerUnit(),
        selectedItemCategory
      );
      const x = itemsLeft + 8;
      for (let i = 0; i < items.length; i++) {
        const y = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
        let color;
        if (items[i] === inventory.getSelectedItem()) {
          color = Colors.YELLOW;
        } else {
          color = Colors.WHITE;
        }
        await this._drawText(
          items[i].name,
          FontName.APPLE_II,
          { x, y },
          color,
          Alignment.LEFT,
          graphics
        );
      }
    }
  };

  private _drawTooltip = async (graphics: Graphics) => {
    const { session } = this;
    const left = 10;
    const top = graphics.getHeight() * 0.6;
    const width = graphics.getWidth() * 0.4;
    const height = graphics.getHeight() * 0.4 - 10;
    graphics.drawRect({ left, top, width, height }, Colors.GRAY_128);

    const lines: string[] | null = (() => {
      const inventory = session.getInventoryState();
      const selectedEquipment = inventory.getSelectedEquipment();
      if (selectedEquipment) {
        const lines: string[] = [];
        lines.push(selectedEquipment.getName());
        const tooltip = selectedEquipment.getTooltip();
        if (tooltip) {
          for (const line of tooltip.split('\n')) {
            lines.push(line);
          }
        }
        return lines;
      }
      const selectedItem = inventory.getSelectedItem();
      if (selectedItem) {
        const lines: string[] = [];
        lines.push(selectedItem.name);
        const tooltip = selectedItem.getTooltip();
        if (tooltip) {
          for (const line of tooltip.split('\n')) {
            lines.push(line);
          }
        }

        return lines;
      }
      return null;
    })();

    if (lines) {
      const lineLeft = left + 5;
      let lineTop = top + 5;
      for (const line of lines) {
        if (line.length > 0) {
          await this._drawText(
            line,
            FontName.APPLE_II,
            { x: lineLeft, y: lineTop },
            Colors.WHITE,
            Alignment.LEFT,
            graphics
          );
          lineTop += 15;
        }
      }
    }
  };
}
