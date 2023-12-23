import Ticker from './Ticker';
import { GameScreen } from './GameScreen';
import { InventoryState, InventoryV2State } from './session/InventoryState';
import { LevelUpScreenState } from './session/LevelUpScreenState';
import Unit from '../entities/units/Unit';
import { checkNotNull } from '../utils/preconditions';
import ImageFactory from '../graphics/images/ImageFactory';

export interface Session {
  getImageFactory: () => ImageFactory;
  getScreen: () => GameScreen;
  setScreen: (screen: GameScreen) => void;
  showPrevScreen: () => void;
  initLevelUpScreen: (playerUnit: Unit) => void;
  getLevelUpScreen: () => LevelUpScreenState;
  prepareInventoryScreen: (playerUnit: Unit) => void;
  prepareInventoryV2: (playerUnit: Unit) => void;
  getInventory: () => InventoryState;
  getInventoryV2: () => InventoryV2State;
  getTicker: () => Ticker;
  reset: () => void;
  setTurnInProgress: (val: boolean) => void;
  isTurnInProgress: () => boolean;
}

export namespace Session {
  export const create = (): Session => new SessionImpl();
}

class SessionImpl implements Session {
  private readonly imageFactory: ImageFactory;
  private readonly ticker: Ticker;
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private levelUpScreen: LevelUpScreenState | null;
  private inventory: InventoryState | null;
  private inventoryV2: InventoryV2State | null;
  private _isTurnInProgress: boolean;

  constructor() {
    this.imageFactory = new ImageFactory();
    this.ticker = new Ticker();
    this.screen = GameScreen.NONE;
    this.prevScreen = null;
    this.levelUpScreen = null;
    this.inventory = null;
    this.inventoryV2 = null;
    this._isTurnInProgress = false;
  }

  getImageFactory = (): ImageFactory => this.imageFactory;

  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => {
    this.prevScreen = this.screen;
    this.screen = screen;
  };

  /**
   * TODO: make this a stack
   */
  showPrevScreen = () => {
    if (this.prevScreen) {
      this.screen = this.prevScreen;
      this.prevScreen = null;
    } else {
      this.screen = GameScreen.GAME;
    }
  };

  initLevelUpScreen = (playerUnit: Unit): void => {
    this.levelUpScreen = new LevelUpScreenState();
    this.levelUpScreen.selectNextAbility(playerUnit);
  };

  getLevelUpScreen = (): LevelUpScreenState => checkNotNull(this.levelUpScreen);

  prepareInventoryScreen = (playerUnit: Unit): void => {
    if (this.inventory === null) {
      this.inventory = new InventoryState();
    }
    if (this.inventory.getSelectedCategory() === null) {
      this.inventory.nextCategory(playerUnit);
    }
    if (this.inventory.getSelectedItem() !== null) {
      const selectedItem = this.inventory.getSelectedItem();
      if (selectedItem !== null && !playerUnit.getInventory().includes(selectedItem)) {
        this.inventory.clearSelectedItem();
      }
    }
    if (this.inventory.getSelectedItem() === null) {
      this.inventory.nextItem(playerUnit);
    }
  };

  prepareInventoryV2 = (playerUnit: Unit): void => {
    if (this.inventoryV2 === null) {
      this.inventoryV2 = new InventoryV2State();
    }
    switch (this.inventoryV2.getSelectedCategory()) {
      case 'EQUIPMENT': {
        const equipment = this.inventoryV2.getSelectedEquipment();
        if (equipment !== null && !playerUnit.getEquipment().includes(equipment)) {
          this.inventoryV2.clearSelectedItem();
        }
        if (equipment === null) {
          this.inventoryV2.nextItem(playerUnit);
        }
        break;
      }
      case 'ITEMS': {
        const selectedItem = this.inventoryV2.getSelectedItem();
        if (selectedItem && !playerUnit.getInventory().includes(selectedItem)) {
          this.inventoryV2.clearSelectedItem();
        }
        if (selectedItem === null) {
          this.inventoryV2.nextItem(playerUnit);
        }
        break;
      }
    }
  };

  getInventory = (): InventoryState => checkNotNull(this.inventory);
  getInventoryV2 = (): InventoryV2State => checkNotNull(this.inventoryV2);
  getTicker = (): Ticker => this.ticker;

  reset = (): void => {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
    this.ticker.clear();
  };

  setTurnInProgress = (val: boolean) => {
    this._isTurnInProgress = val;
  };

  /**
   * Used for showing the "busy" indicator in the UI
   */
  isTurnInProgress = (): boolean => this._isTurnInProgress;
}
