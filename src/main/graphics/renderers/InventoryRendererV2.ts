import { RenderContext, Renderer } from './Renderer';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import EquipmentSlot from '../../schemas/EquipmentSlot';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_WIDTH = SCREEN_WIDTH;
const INVENTORY_HEIGHT = SCREEN_HEIGHT;
const INVENTORY_MARGIN = 10;

const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';

type Props = Readonly<{
  textRenderer: TextRenderer;
  graphics: Graphics;
}>;

export default class InventoryRendererV2 implements Renderer {
  private readonly textRenderer: TextRenderer;
  private readonly graphics: Graphics;

  constructor({ textRenderer, graphics }: Props) {
    this.textRenderer = textRenderer;
    this.graphics = graphics;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (context: RenderContext) => {
    await this._drawBackground(context);
    await this._drawEquipment(context);
    await this._drawInventory(context);
    await this._drawTooltip(context);
  };

  private _drawText = async (
    text: string,
    font: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment
  ) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };

  private _drawBackground = async ({ session }: RenderContext) => {
    const imageFactory = session.getImageFactory();
    const { graphics } = this;
    graphics.clear();

    const image = await imageFactory.getImage({
      filename: INVENTORY_BACKGROUND_FILENAME
    });
    // TODO: need a 640x360 version of this image
    graphics.drawScaledImage(image, {
      left: INVENTORY_LEFT,
      top: INVENTORY_TOP,
      width: INVENTORY_WIDTH,
      height: INVENTORY_HEIGHT
    });
  };

  private _drawEquipment = async (context: RenderContext) => {
    const { session } = context;
    const inventory = session.getInventoryV2();
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;

    await this._drawText(
      'EQUIPMENT',
      FontName.APPLE_II,
      { x: INVENTORY_WIDTH / 4, y: INVENTORY_TOP + INVENTORY_MARGIN },
      inventory.getSelectedCategory() === 'EQUIPMENT' ? Colors.YELLOW : Colors.WHITE,
      Alignment.CENTER
    );
    await this._drawText(
      'INVENTORY',
      FontName.APPLE_II,
      { x: (INVENTORY_WIDTH * 3) / 4, y: INVENTORY_TOP + INVENTORY_MARGIN },
      inventory.getSelectedCategory() === 'ITEMS' ? Colors.YELLOW : Colors.WHITE,
      Alignment.CENTER
    );

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    const playerUnit = session.getPlayerUnit();
    for (const equipment of playerUnit.getEquipment().getAll()) {
      const text = `${_equipmentSlotToString(equipment.slot)} - ${equipment.getName()}`;
      await this._drawText(
        text,
        FontName.APPLE_II,
        { x: equipmentLeft, y },
        inventory.getSelectedEquipment() === equipment ? Colors.YELLOW : Colors.WHITE,
        Alignment.LEFT
      );
      y += LINE_HEIGHT;
    }
  };

  private _drawInventory = async (context: RenderContext) => {
    const { session } = context;
    const inventory = session.getInventoryV2();
    const inventoryCategories = inventory.getItemCategories();
    const categoryWidth = 60;
    const xOffset = 4;
    const itemsLeft = (INVENTORY_WIDTH + INVENTORY_MARGIN) / 2;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + categoryWidth / 2 + xOffset;
      const top = INVENTORY_TOP + 40;
      await this._drawText(
        inventoryCategories[i],
        FontName.APPLE_II,
        { x, y: top },
        Colors.WHITE,
        Alignment.CENTER
      );
      if (inventoryCategories[i] === inventory.getSelectedItemCategory()) {
        // TODO can we make a `drawLine`?
        const rect = {
          left: x - categoryWidth / 2 + 4,
          top: INVENTORY_TOP + 54,
          width: categoryWidth - 8,
          height: 1
        };
        this.graphics.fillRect(rect, Colors.WHITE);
      }
    }

    // draw inventory items
    const selectedItemCategory = inventory.getSelectedItemCategory();
    if (selectedItemCategory) {
      const items = inventory.getItems(session.getPlayerUnit(), selectedItemCategory);
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
          Alignment.LEFT
        );
      }
    }
  };

  private _drawTooltip = async ({ session }: RenderContext) => {
    const { graphics } = this;
    const left = 10;
    const top = graphics.getHeight() * 0.6;
    const width = graphics.getWidth() * 0.4;
    const height = graphics.getHeight() * 0.4 - 10;
    graphics.drawRect({ left, top, width, height }, Colors.GRAY_128);

    const lines: string[] | null = (() => {
      const inventory = session.getInventoryV2();
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
            Alignment.LEFT
          );
          lineTop += 15;
        }
      }
    }
  };
}

const _equipmentSlotToString = (slot: EquipmentSlot) =>
  slot.toUpperCase().replaceAll('_', ' ');
