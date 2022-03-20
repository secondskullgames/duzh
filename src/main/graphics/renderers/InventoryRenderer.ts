import GameState from '../../core/GameState';
import InventoryMap from '../../items/InventoryMap';
import ItemCategory from '../../items/ItemCategory';
import Color, { Colors } from '../../types/Color';
import Coordinates from '../../geometry/Coordinates';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageLoader from '../images/ImageLoader';
import { Alignment, drawAligned } from '../RenderingUtils';
import Renderer from './Renderer';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_WIDTH = SCREEN_WIDTH;
const INVENTORY_HEIGHT = SCREEN_HEIGHT;
const INVENTORY_MARGIN = 10;

const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';

class InventoryRenderer extends Renderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'inventory' });
  }

  _redraw = async () => {
    const playerUnit = GameState.getInstance().getPlayerUnit();
    const inventory = playerUnit.getInventory();
    const { canvas, context } = this;

    const imageData = await ImageLoader.loadImage(INVENTORY_BACKGROUND_FILENAME);
    const imageBitmap = await createImageBitmap(imageData);
    await context.drawImage(imageBitmap, INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);

    // draw equipment
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;
    const itemsLeft = (canvas.width + INVENTORY_MARGIN) / 2;

    const promises: Promise<any>[] = [];
    promises.push(this._drawText('EQUIPMENT', Fonts.PRESS_START_2P, { x: canvas.width / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, 'center'));
    promises.push(this._drawText('INVENTORY', Fonts.PRESS_START_2P, { x: canvas.width * 3 / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Colors.WHITE, 'center'));

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    for (const equipment of playerUnit.getEquipment().getAll()) {
      promises.push(this._drawText(`${equipment.slot} - ${equipment.name}`, Fonts.PRESS_START_2P, { x: equipmentLeft, y }, Colors.WHITE, 'left'));
      y += LINE_HEIGHT;
    }

    // draw inventory categories
    const inventoryCategories = inventory.getCategories();
    const categoryWidth = 60;
    const xOffset = 4;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
      const top = INVENTORY_TOP + 40;
      promises.push(this._drawText(inventoryCategories[i], Fonts.PRESS_START_2P, { x, y: top }, Colors.WHITE, 'center'));
      if (inventoryCategories[i] === inventory.selectedCategory) {
        context.fillStyle = Colors.WHITE;
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
        promises.push(this._drawText(items[i].name, Fonts.PRESS_START_2P, { x, y }, color, 'left'));
      }
    }
    await Promise.all(promises);
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    await drawAligned(imageBitmap, this.context, { x, y }, textAlign);
  };
}

export default InventoryRenderer;
