import { ScreenInputHandler } from './ScreenInputHandler';
import { type KeyCommand, ModifierKey, TouchCommand } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { useItem } from '@main/actions/useItem';
import { GameScreen } from '@main/core/GameScreen';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { Rect } from '@lib/geometry/Rect';
import InventoryItem from '@main/items/InventoryItem';
import { ItemCategory } from '@models/ItemCategory';
import { displayableItemCategories } from '@main/core/session/InventoryState';
import { inject, injectable } from 'inversify';

@injectable()
export default class InventoryScreenInputHandler implements ScreenInputHandler {
  constructor(
    @inject(Session)
    private readonly session: Session,
    @inject(GameState)
    private readonly state: GameState
  ) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { session } = this;
    const { key, modifiers } = command;
    const playerUnit = session.getPlayerUnit();
    const inventory = session.getInventoryState();

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
        session.setScreen(GameScreen.GAME);
        break;
      case 'M':
        session.setScreen(GameScreen.MAP);
        break;
      case 'F1':
        session.setScreen(GameScreen.HELP);
        break;
      case 'ESCAPE':
        session.setScreen(GameScreen.GAME);
    }
  };

  handleKeyUp = async () => {};

  private _handleEnter = async () => {
    const { state, session } = this;
    const playerUnit = session.getPlayerUnit();
    const inventory = session.getInventoryState();
    const selectedItem = inventory.getSelectedItem();

    if (selectedItem) {
      await useItem(playerUnit, selectedItem, state, session);
      session.prepareInventoryScreen(playerUnit);
    }
  };

  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleTouchDown = async ({ pixel }: TouchCommand) => {
    const { state, session } = this;
    const playerUnit = session.getPlayerUnit();
    const inventoryState = session.getInventoryState();

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
          await useItem(playerUnit, item, state, session);
          session.prepareInventoryScreen(playerUnit);
        } else {
          inventoryState.selectItem(session.getPlayerUnit(), item);
        }
        return;
      }
    }
    session.setScreen(GameScreen.GAME);
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

  /** TODO this sucks */
  private _getItemRects = (): [InventoryItem, Rect][] => {
    const { session } = this;
    const inventoryScreenState = session.getInventoryState();
    const itemCategory = inventoryScreenState.getSelectedItemCategory();
    const itemRects: [InventoryItem, Rect][] = [];
    if (itemCategory) {
      const visibleItems = inventoryScreenState.getItems(
        session.getPlayerUnit(),
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
}
