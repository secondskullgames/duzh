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

  private _drawEquipment = async (context: RenderContext) => {
    const { state, session } = context;
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
    const playerUnit = state.getPlayerUnit();
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
    const { state, session } = context;
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
      const items = inventory.getItems(state.getPlayerUnit(), selectedItemCategory);
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

  private _drawBackground = async ({ imageFactory }: RenderContext) => {
    const { graphics } = this;

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
}

const _equipmentSlotToString = (slot: EquipmentSlot) =>
  slot.toUpperCase().replaceAll('_', ' ');
