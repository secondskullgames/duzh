import Ticker from './Ticker';
import { GameScreen } from './GameScreen';
import { InventoryCategory, InventoryState } from './session/InventoryState';
import { LevelUpScreenState } from './session/LevelUpScreenState';
import Unit from '../units/Unit';
import MapInstance from '../maps/MapInstance';
import { checkNotNull, checkState } from '@lib/utils/preconditions';
import { injectable } from 'inversify';
import type { UnitAbility } from '@main/abilities/UnitAbility';

export interface Session {
  getScreen: () => GameScreen;
  setScreen: (screen: GameScreen) => void;
  showPrevScreen: () => void;
  initLevelUpScreen: (playerUnit: Unit) => void;
  getLevelUpScreen: () => LevelUpScreenState;
  prepareInventoryScreen: (playerUnit: Unit) => void;
  getInventoryState: () => InventoryState;
  getTicker: () => Ticker;
  reset: () => void;
  getPlayerUnit: () => Unit;
  setPlayerUnit: (unit: Unit) => void;
  setTurnInProgress: (val: boolean) => void;
  isTurnInProgress: () => boolean;
  getMapIndex: () => number;

  setMapIndex: (mapIndex: number) => void;
  setMap: (map: MapInstance) => void;
  getMap: () => MapInstance;

  getTurn: () => number;
  nextTurn: () => void;

  getQueuedAbility: () => UnitAbility | null;
  setQueuedAbility: (ability: UnitAbility | null) => void;
}

export const Session = Symbol('Session');

@injectable()
export class SessionImpl implements Session {
  private readonly ticker: Ticker;
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private levelUpScreen: LevelUpScreenState | null;
  private inventoryState: InventoryState | null;
  private playerUnit: Unit | null;
  private _isTurnInProgress: boolean;
  private mapIndex: number;
  private map: MapInstance | null;
  private turn: number;
  private queuedAbility: UnitAbility | null;

  constructor() {
    this.ticker = new Ticker();
    this.screen = GameScreen.NONE;
    this.prevScreen = null;
    this.levelUpScreen = null;
    this.inventoryState = null;
    this._isTurnInProgress = false;
    this.playerUnit = null;
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
  }

  getPlayerUnit = (): Unit => checkNotNull(this.playerUnit);
  setPlayerUnit = (unit: Unit): void => {
    checkState(this.playerUnit === null);
    this.playerUnit = unit;
  };

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
    if (this.inventoryState === null) {
      this.inventoryState = new InventoryState();
    }
    switch (this.inventoryState.getSelectedCategory()) {
      case InventoryCategory.EQUIPMENT: {
        const equipment = this.inventoryState.getSelectedEquipment();
        if (equipment !== null && !playerUnit.getEquipment().includes(equipment)) {
          this.inventoryState.clearSelectedItem();
        }
        if (equipment === null) {
          this.inventoryState.nextItem(playerUnit);
        }
        break;
      }
      case InventoryCategory.ITEMS: {
        const selectedItem = this.inventoryState.getSelectedItem();
        if (selectedItem && !playerUnit.getInventory().includes(selectedItem)) {
          this.inventoryState.clearSelectedItem();
        }
        if (selectedItem === null) {
          this.inventoryState.nextItem(playerUnit);
        }
        break;
      }
    }
  };

  getInventoryState = (): InventoryState => checkNotNull(this.inventoryState);
  getTicker = (): Ticker => this.ticker;

  reset = (): void => {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
    this.ticker.clear();
    this.playerUnit = null;
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
  };

  setTurnInProgress = (val: boolean) => {
    this._isTurnInProgress = val;
  };

  /**
   * Used for showing the "busy" indicator in the UI
   */
  isTurnInProgress = (): boolean => this._isTurnInProgress;

  getMapIndex = () => this.mapIndex;

  setMapIndex = (mapIndex: number): void => {
    this.mapIndex = mapIndex;
  };

  getMap = (): MapInstance =>
    checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  setMap = (map: MapInstance): void => {
    this.map = map;
  };

  getTurn = () => this.turn;
  nextTurn = () => {
    this.turn++;
  };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };
}
