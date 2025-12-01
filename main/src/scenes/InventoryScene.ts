import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@main/input/inputTypes';
import { toggleFullScreen } from '@main/utils/dom';
import { useItem } from '@main/actions/useItem';
import { Rect } from '@duzh/geometry';
import { ItemCategory } from '@duzh/models';
import { displayableItemCategories } from '@main/core/state/InventoryState';
import InventoryItem from '@main/items/InventoryItem';
import { Graphics } from '@duzh/graphics';
import { Game } from '@main/core/Game';
import { checkNotNull } from '@duzh/utils/preconditions';
import { InventorySceneRenderer } from '../graphics/renderers/InventorySceneRenderer';

export class InventoryScene implements Scene {
  readonly name = SceneName.INVENTORY;

  constructor(
    private readonly game: Game,
    private readonly renderer: InventorySceneRenderer
  ) {}

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
    await this.renderer.render(graphics);
  };
}
