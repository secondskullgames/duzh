import GameState from '../../core/GameState';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageFactory from '../images/ImageFactory';
import { Alignment, drawAligned } from '../RenderingUtils';
import AbstractRenderer from './AbstractRenderer';
import EquipmentSlot from '../../schemas/EquipmentSlot';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_WIDTH = SCREEN_WIDTH;
const INVENTORY_HEIGHT = SCREEN_HEIGHT;
const INVENTORY_MARGIN = 10;

const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';

type Props = Readonly<{
  state: GameState
}>;

class InventoryRenderer extends AbstractRenderer {
  private readonly state: GameState;

  constructor({ state }: Props) {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'inventory' });
    this.state = state;
  }

  _redraw = async () => {
    const playerUnit = this.state.getPlayerUnit();
    const inventory = playerUnit.getInventory();
    const { canvas, context } = this;

    const image = await ImageFactory.getInstance().getImage({ filename: INVENTORY_BACKGROUND_FILENAME });
    context.drawImage(image.bitmap, INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);

    // draw equipment
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;
    const itemsLeft = (canvas.width + INVENTORY_MARGIN) / 2;

    await this._drawText('EQUIPMENT', Fonts.APPLE_II, { x: canvas.width / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, 'center');
    await this._drawText('INVENTORY', Fonts.APPLE_II, { x: canvas.width * 3 / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, 'center');

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    for (const equipment of playerUnit.getEquipment().getAll()) {
      const text = `${_equipmentSlotToString(equipment.slot)} - ${equipment.getName()}`;
      await this._drawText(text, Fonts.APPLE_II, { x: equipmentLeft, y }, Colors.WHITE, 'left');
      y += LINE_HEIGHT;
    }

    // draw inventory categories
    const inventoryCategories = inventory.getCategories();
    const categoryWidth = 60;
    const xOffset = 4;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
      const top = INVENTORY_TOP + 40;
      await this._drawText(inventoryCategories[i], Fonts.APPLE_II, { x, y: top }, Colors.WHITE, 'center');
      if (inventoryCategories[i] === inventory.selectedCategory) {
        context.fillStyle = Colors.WHITE.hex;
        context.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 54, categoryWidth - 8, 1);
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
        await this._drawText(items[i].name, Fonts.APPLE_II, { x, y }, color, 'left');
      }
    }
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    drawAligned(imageBitmap, this.context, { x, y }, textAlign);
  };
}

const _equipmentSlotToString = (slot: EquipmentSlot) => slot.toUpperCase().replaceAll('_', ' ');

export default InventoryRenderer;
