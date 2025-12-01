import { Renderer } from './Renderer';
import { Color, Graphics } from '@duzh/graphics';
import { FontName } from '../Fonts';
import { Pixel } from '@duzh/geometry';
import { Alignment, drawAligned } from '../RenderingUtils';
import { InterfaceColors } from '../InterfaceColors';
import { checkNotNull } from '@duzh/utils/preconditions';
import { InventoryCategory } from '../../core/state/InventoryState';
import { getSlotName, splitTooltipToLines } from '../../equipment/EquipmentUtils';
import { LINE_HEIGHT } from '../constants';
import { Game } from '../../core/Game';
import { TextRenderer } from '../TextRenderer';
import { ImageFactory } from '@duzh/graphics/images';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_MARGIN = 10;
const INVENTORY_BACKGROUND_FILENAME = 'inventory2';

export type Props = Readonly<{
  game: Game;
  textRenderer: TextRenderer;
  imageFactory: ImageFactory;
}>;

export class InventorySceneRenderer implements Renderer {
  private readonly game: Game;
  private readonly textRenderer: TextRenderer;
  private readonly imageFactory: ImageFactory;
  private readonly inventoryWidth: number;
  private readonly inventoryHeight: number;

  constructor(props: Props) {
    this.game = props.game;
    this.textRenderer = props.textRenderer;
    this.imageFactory = props.imageFactory;
    this.inventoryWidth = this.game.config.screenWidth;
    this.inventoryHeight = this.game.config.screenHeight;
  }

  render = async (graphics: Graphics) => {
    await this._drawBackground(graphics);
    this._drawEquipment(graphics);
    this._drawInventory(graphics);
    this._drawTooltip(graphics);
  };

  private _drawText = (
    text: string,
    fontName: FontName,
    pixel: Pixel,
    color: Color,
    textAlign: Alignment,
    graphics: Graphics
  ) => {
    const imageData = this.textRenderer.renderText({
      text,
      fontName,
      color,
      backgroundColor: InterfaceColors.BLACK
    });
    drawAligned(imageData, graphics, pixel, textAlign);
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

  private _drawEquipment = (graphics: Graphics) => {
    const { state } = this.game;
    const inventory = checkNotNull(state.getInventoryState());
    const equipmentLeft = INVENTORY_LEFT + INVENTORY_MARGIN;

    this._drawText(
      'EQUIPMENT',
      FontName.APPLE_II,
      { x: this.inventoryWidth / 4, y: INVENTORY_TOP + INVENTORY_MARGIN },
      inventory.getSelectedCategory() === InventoryCategory.EQUIPMENT
        ? InterfaceColors.YELLOW
        : InterfaceColors.WHITE,
      Alignment.CENTER,
      graphics
    );
    this._drawText(
      'INVENTORY',
      FontName.APPLE_II,
      { x: (this.inventoryWidth * 3) / 4, y: INVENTORY_TOP + INVENTORY_MARGIN },
      inventory.getSelectedCategory() === InventoryCategory.ITEMS
        ? InterfaceColors.YELLOW
        : InterfaceColors.WHITE,
      Alignment.CENTER,
      graphics
    );

    // draw equipment items
    // for now, just display them all in one list

    let y = INVENTORY_TOP + 64;
    const playerUnit = state.getPlayerUnit();
    for (const equipment of playerUnit.getEquipment().getAll()) {
      const text = `${getSlotName(equipment.slot)} - ${equipment.getName()}`;
      this._drawText(
        text,
        FontName.APPLE_II,
        { x: equipmentLeft, y },
        inventory.getSelectedEquipment() === equipment
          ? InterfaceColors.YELLOW
          : InterfaceColors.WHITE,
        Alignment.LEFT,
        graphics
      );
      y += LINE_HEIGHT;
    }
  };

  private _drawInventory = (graphics: Graphics) => {
    const { state } = this.game;
    const inventory = checkNotNull(state.getInventoryState());
    const inventoryCategories = inventory.getItemCategories();
    const categoryWidth = 60;
    const xOffset = 4;
    const itemsLeft = (this.inventoryWidth + INVENTORY_MARGIN) / 2;

    for (let i = 0; i < inventoryCategories.length; i++) {
      const x = itemsLeft + i * categoryWidth + categoryWidth / 2 + xOffset;
      const top = INVENTORY_TOP + 40;
      this._drawText(
        inventoryCategories[i],
        FontName.APPLE_II,
        { x, y: top },
        InterfaceColors.WHITE,
        Alignment.CENTER,
        graphics
      );
      if (inventoryCategories[i] === inventory.getSelectedItemCategory()) {
        // TODO can we make a `drawLine`?
        const rect = {
          left: Math.round(x - categoryWidth / 2 + 4),
          top: INVENTORY_TOP + 54,
          width: categoryWidth - 8,
          height: 1
        };
        graphics.fillRect(rect, InterfaceColors.WHITE);
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
          color = InterfaceColors.YELLOW;
        } else {
          color = InterfaceColors.WHITE;
        }
        this._drawText(
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

  private _drawTooltip = (graphics: Graphics) => {
    const { state } = this.game;
    const left = 10;
    const top = Math.round(graphics.getHeight() * 0.6);

    const lines: string[] | null = (() => {
      const inventory = checkNotNull(state.getInventoryState());
      const selectedEquipment = inventory.getSelectedEquipment();
      if (selectedEquipment) {
        const lines: string[] = [];
        lines.push(selectedEquipment.getName());
        const tooltip = selectedEquipment.getTooltip();
        if (tooltip) {
          lines.push(...splitTooltipToLines(tooltip, 27));
        }
        return lines;
      }
      const selectedItem = inventory.getSelectedItem();
      if (selectedItem) {
        const lines: string[] = [];
        lines.push(selectedItem.name);
        const tooltip = selectedItem.getTooltip();
        if (tooltip) {
          lines.push(...splitTooltipToLines(tooltip, 27));
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
          this._drawText(
            line,
            FontName.APPLE_II,
            { x: lineLeft, y: lineTop },
            InterfaceColors.WHITE,
            Alignment.LEFT,
            graphics
          );
          lineTop += 15;
        }
      }
    }
  };
}
