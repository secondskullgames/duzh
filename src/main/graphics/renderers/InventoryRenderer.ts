import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { TextRenderer } from '../TextRenderer';
import { Alignment, drawAligned } from '../RenderingUtils';
import EquipmentSlot from '../../schemas/EquipmentSlot';
import { RenderContext, Renderer } from './Renderer';
import { Pixel } from '../Pixel';
import { Graphics } from '../Graphics';
import { FontName } from '../Fonts';
import ImageFactory from '../images/ImageFactory';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_WIDTH = SCREEN_WIDTH;
const INVENTORY_HEIGHT = SCREEN_HEIGHT;
const INVENTORY_MARGIN = 10;

const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';

type Props = Readonly<{
  textRenderer: TextRenderer,
  graphics: Graphics
}>;

export default class InventoryRenderer implements Renderer {
  private readonly textRenderer: TextRenderer;
  private readonly graphics: Graphics;

  constructor({ textRenderer, graphics }: Props) {
    this.textRenderer = textRenderer;
    this.graphics = graphics;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async ({ state }: RenderContext) => {
    const playerUnit = state.getPlayerUnit();
    const inventory = playerUnit.getInventory();
    const { graphics } = this;

    const image = await ImageFactory.getImage({ filename: INVENTORY_BACKGROUND_FILENAME });
    // TODO: need a 640x360 version of this image
    graphics.drawScaledImage(image, {
      left: INVENTORY_LEFT,
      top: INVENTORY_TOP,
      width: INVENTORY_WIDTH,
      height: INVENTORY_HEIGHT
    });

    // draw equipment
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;
    const itemsLeft = (INVENTORY_WIDTH + INVENTORY_MARGIN) / 2;

    await this._drawText('EQUIPMENT', FontName.APPLE_II, { x: INVENTORY_WIDTH / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, Alignment.CENTER);
    await this._drawText('INVENTORY', FontName.APPLE_II, { x: INVENTORY_WIDTH * 3 / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, Alignment.CENTER);

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    for (const equipment of playerUnit.getEquipment().getAll()) {
      const text = `${_equipmentSlotToString(equipment.slot)} - ${equipment.getName()}`;
      await this._drawText(text, FontName.APPLE_II, { x: equipmentLeft, y }, Colors.WHITE, Alignment.LEFT);
      y += LINE_HEIGHT;
    }

    // draw inventory categories
    const inventoryCategories = inventory.getCategories();
    const categoryWidth = 60;
    const xOffset = 4;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
      const top = INVENTORY_TOP + 40;
      await this._drawText(inventoryCategories[i], FontName.APPLE_II, { x, y: top }, Colors.WHITE, Alignment.CENTER);
      if (inventoryCategories[i] === inventory.selectedCategory) {
        // TODO can we make a `drawLine`?
        const rect = {
          left: x - (categoryWidth / 2) + 4,
          top: INVENTORY_TOP + 54,
          width: categoryWidth - 8,
          height: 1
        };
        this.graphics.fillRect(rect, Colors.WHITE);
      }
    }

    // draw inventory items
    if (inventory.selectedCategory) {
      const items = inventory.get(inventory.selectedCategory);
      const x = itemsLeft + 8;
      for (let i = 0; i < items.length; i++) {
        const y = INVENTORY_TOP + 64 + LINE_HEIGHT * i;
        let color;
        if (items[i] === inventory.selectedItem) {
          color = Colors.YELLOW;
        } else {
          color = Colors.WHITE;
        }
        await this._drawText(items[i].name, FontName.APPLE_II, { x, y }, color, Alignment.LEFT);
      }
    }
  };

  private _drawText = async (text: string, font: FontName, pixel: Pixel, color: Color, textAlign: Alignment) => {
    const image = await this.textRenderer.renderText(text, font, color);
    drawAligned(image, this.graphics, pixel, textAlign);
  };
}

const _equipmentSlotToString = (slot: EquipmentSlot) => slot.toUpperCase().replaceAll('_', ' ');
