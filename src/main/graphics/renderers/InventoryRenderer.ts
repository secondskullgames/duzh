import GameState from '../../core/GameState';
import Color from '../../types/Color';
import { Coordinates, ItemCategory } from '../../types/types';
import BufferedRenderer from './BufferedRenderer';
import { LINE_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import { FontDefinition, Fonts, renderFont } from '../FontRenderer';
import ImageLoader from '../images/ImageLoader';
import { Alignment, drawAligned } from '../RenderingUtils';

const INVENTORY_LEFT = 2 * TILE_WIDTH;
const INVENTORY_TOP = 2 * TILE_HEIGHT;
const INVENTORY_WIDTH = 16 * TILE_WIDTH;
const INVENTORY_HEIGHT = 11 * TILE_HEIGHT;
const INVENTORY_MARGIN = 12;

const INVENTORY_BACKGROUND_FILENAME = 'inventory_background';

class InventoryRenderer extends BufferedRenderer {
  constructor() {
    super({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, id: 'inventory' });
  }

  renderBuffer = async () => {
    const state = GameState.getInstance();
    const { playerUnit } = state;
    const { inventory } = playerUnit;
    const { bufferCanvas, bufferContext } = this;

    const imageData = await ImageLoader.loadImage(INVENTORY_BACKGROUND_FILENAME);
    const imageBitmap = await createImageBitmap(imageData);
    await this.bufferContext.drawImage(imageBitmap, INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);

    // draw equipment
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;
    const itemsLeft = (bufferCanvas.width + INVENTORY_MARGIN) / 2;

    const promises: Promise<any>[] = [];
    promises.push(this._drawText('EQUIPMENT', Fonts.PERFECT_DOS_VGA, { x: bufferCanvas.width / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Color.WHITE, 'center'));
    promises.push(this._drawText('INVENTORY', Fonts.PERFECT_DOS_VGA, { x: bufferCanvas.width * 3 / 4, y: INVENTORY_TOP + INVENTORY_MARGIN }, Color.WHITE, 'center'));

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    for (const [slot, equipment] of playerUnit.equipment.getEntries()) {
      promises.push(this._drawText(`${slot} - ${equipment.name}`, Fonts.PERFECT_DOS_VGA, { x: equipmentLeft, y }, Color.WHITE, 'left'));
      y += LINE_HEIGHT;
    }

    // draw inventory categories
    const inventoryCategories: ItemCategory[] = Object.values(ItemCategory);
    const categoryWidth = 60;
    const xOffset = 4;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + (categoryWidth / 2) + xOffset;
      const top = INVENTORY_TOP + 40;
      promises.push(this._drawText(inventoryCategories[i], Fonts.PERFECT_DOS_VGA, { x, y: top }, Color.WHITE, 'center'));
      if (inventoryCategories[i] === inventory.selectedCategory) {
        bufferContext.fillStyle = Color.WHITE;
        bufferContext.fillRect(x - (categoryWidth / 2) + 4, INVENTORY_TOP + 54, categoryWidth - 8, 1);
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
          color = Color.YELLOW;
        } else {
          color = Color.WHITE;
        }
        promises.push(this._drawText(items[i].name, Fonts.PERFECT_DOS_VGA, { x, y }, color, 'left'));
      }
    }
    await Promise.all(promises);
  };

  private _drawText = async (text: string, font: FontDefinition, { x, y }: Coordinates, color: Color, textAlign: Alignment) => {
    const imageBitmap = await renderFont(text, font, color);
    await drawAligned(imageBitmap, this.bufferContext, { x, y }, textAlign);
  };
}

export default InventoryRenderer;
