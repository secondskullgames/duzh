import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { useItem } from '@main/actions/useItem';
import { Rect } from '@lib/geometry/Rect';
import { ItemCategory } from '@models/ItemCategory';
import {
  displayableItemCategories,
  InventoryCategory
} from '@main/core/state/InventoryState';
import InventoryItem from '@main/items/InventoryItem';
import { TextRenderer } from '@main/graphics/TextRenderer';
import ImageFactory from '@lib/graphics/images/ImageFactory';
import { Graphics } from '@lib/graphics/Graphics';
import { FontName } from '@main/graphics/Fonts';
import { Pixel } from '@lib/geometry/Pixel';
import { Color } from '@lib/graphics/Color';
import { Alignment, drawAligned } from '@main/graphics/RenderingUtils';
import Colors from '@main/graphics/Colors';
import { getSlotName, splitTooltipToLines } from '@main/equipment/EquipmentUtils';
import { LINE_HEIGHT } from '@main/graphics/constants';
import { Game } from '@main/core/Game';
import { checkNotNull } from '@lib/utils/preconditions';

const INVENTORY_LEFT = 0;
const INVENTORY_TOP = 0;
const INVENTORY_MARGIN = 10;

const INVENTORY_BACKGROUND_FILENAME = 'inventory2';

export class InventoryScene implements Scene {
  readonly name = SceneName.INVENTORY;
  private readonly inventoryWidth: number;
  private readonly inventoryHeight: number;

  constructor(
    private readonly game: Game,
    private readonly textRenderer: TextRenderer,
    private readonly imageFactory: ImageFactory
  ) {
    this.inventoryWidth = game.config.screenWidth;
    this.inventoryHeight = game.config.screenHeight;
  }

  handleKeyDown = async (command: KeyCommand) => {
    const { state } = this.game;
    const { key, modifiers } = command;
    const playerUnit = state.getPlayerUnit();
    const inventory = checkNotNull(state.getInventoryState());

    switch (key) {
      case 'UP':
        inventory.previousItem(playerUnit);
        break;
      case 'DOWN':
        inventory.nextItem(playerUnit);
        break;
      case 'LEFT':
        inventory.previousCategory(playerUnit);
        break;
      case 'RIGHT':
        inventory.nextCategory(playerUnit);
        break;
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        } else {
          await this._handleEnter();
        }
        break;
      case 'TAB':
        state.setScene(SceneName.GAME);
        break;
      case 'M':
        state.setScene(SceneName.MAP);
        break;
      case 'F1':
        state.setScene(SceneName.HELP);
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  private _handleEnter = async () => {
    const { state, inventoryController } = this.game;
    const playerUnit = state.getPlayerUnit();
    const inventory = checkNotNull(state.getInventoryState());
    const selectedItem = inventory.getSelectedItem();

    if (selectedItem) {
      await useItem(playerUnit, selectedItem, this.game);
      inventoryController.prepareInventoryScreen(this.game);
    }
  };

  handleClick = async ({ pixel }: ClickCommand) => {
    const { state, inventoryController } = this.game;
    const playerUnit = state.getPlayerUnit();
    const inventoryState = checkNotNull(state.getInventoryState());

    const itemCategoryRects = this._getItemCategoryRects();
    for (const [category, rect] of itemCategoryRects) {
      if (Rect.containsPoint(rect, pixel)) {
        inventoryState.selectItemCategory(category);
        return;
      }
    }

    const itemRects = this._getItemRects();
    for (const [item, rect] of itemRects) {
      if (Rect.containsPoint(rect, pixel)) {
        if (inventoryState.getSelectedItem() == item) {
          await useItem(playerUnit, item, this.game);
          inventoryController.prepareInventoryScreen(this.game);
        } else {
          inventoryState.selectItem(state.getPlayerUnit(), item);
        }
        return;
      }
    }
    state.setScene(SceneName.GAME);
  };

  /** TODO this sucks */
  private _getItemCategoryRects = (): [ItemCategory, Rect][] => {
    const itemCategoryRects: [ItemCategory, Rect][] = [];
    for (let i = 0; i < displayableItemCategories.length; i++) {
      const itemCategory = displayableItemCategories[i];
      // TODO this sucks
      const rect = {
        left: 329 + i * 60,
        top: 40,
        width: 60,
        height: 20
      };
      itemCategoryRects.push([itemCategory, rect]);
    }
    return itemCategoryRects;
  };

  private _getItemRects = (): [InventoryItem, Rect][] => {
    const { state } = this.game;
    const inventoryScreenState = checkNotNull(state.getInventoryState());
    const itemCategory = inventoryScreenState.getSelectedItemCategory();
    const itemRects: [InventoryItem, Rect][] = [];
    if (itemCategory) {
      const visibleItems = inventoryScreenState.getItems(
        state.getPlayerUnit(),
        itemCategory
      );
      for (let i = 0; i < visibleItems.length; i++) {
        const item = visibleItems[i];
        itemRects.push([
          item,
          // TODO this sucks
          { left: 333, top: 64 + 12 * i, width: 200, height: 12 }
        ]);
      }
    }
    return itemRects;
  };

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
      backgroundColor: Colors.BLACK
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
        ? Colors.YELLOW
        : Colors.WHITE,
      Alignment.CENTER,
      graphics
    );
    this._drawText(
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
    const playerUnit = state.getPlayerUnit();
    for (const equipment of playerUnit.getEquipment().getAll()) {
      const text = `${getSlotName(equipment.slot)} - ${equipment.getName()}`;
      this._drawText(
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
        Colors.WHITE,
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
        graphics.fillRect(rect, Colors.WHITE);
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
