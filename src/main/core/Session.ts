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
  reset: () => void;
  getPlayerUnit: () => Unit;
  setPlayerUnit: (unit: Unit) => void;

  getQueuedAbility: () => UnitAbility | null;
  setQueuedAbility: (ability: UnitAbility | null) => void;
}

export const Session = Symbol('Session');

@injectable()
export class SessionImpl implements Session {
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private levelUpScreen: LevelUpScreenState | null;
  private inventoryState: InventoryState | null;
  private playerUnit: Unit | null;
  private queuedAbility: UnitAbility | null;

  constructor() {
    this.screen = GameScreen.NONE;
    this.prevScreen = null;
    this.levelUpScreen = null;
    this.inventoryState = null;
    this.playerUnit = null;
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

  reset = (): void => {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
    this.playerUnit = null;
    this.queuedAbility = null;
  };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };
}
