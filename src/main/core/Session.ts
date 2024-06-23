import Ticker from './Ticker';
import { GameScreen } from './GameScreen';
import { InventoryCategory, InventoryState } from './session/InventoryState';
import { LevelUpScreenState } from './session/LevelUpScreenState';
import Unit from '../units/Unit';
import MapInstance from '../maps/MapInstance';
import { checkNotNull, checkState } from '@lib/utils/preconditions';
import { Seconds } from '@lib/utils/time';
import { ShrineMenuState } from '@main/core/session/ShrineMenuState';
import { UnitAbility } from '@main/abilities/UnitAbility';
import { Feature } from '@main/utils/features';
import { AbilityName } from '@main/abilities/AbilityName';
import { GameState } from '@main/core/GameState';
import Sounds from '@main/sounds/Sounds';
import { sample } from '@lib/utils/random';
import { injectable } from 'inversify';

export interface Session {
  startGameTimer: () => void;
  endGameTimer: () => void;
  getScreen: () => GameScreen;
  setScreen: (screen: GameScreen) => void;
  showPrevScreen: () => void;
  initLevelUpScreen: (playerUnit: Unit) => void;
  getLevelUpScreen: () => LevelUpScreenState;
  initShrineMenu: () => void;
  getShrineMenuState: () => ShrineMenuState;
  isShowingShrineMenu: () => boolean;
  closeShrineMenu: () => void;
  prepareInventoryScreen: (playerUnit: Unit) => void;
  getInventoryState: () => InventoryState;
  getTicker: () => Ticker;
  reset: () => void;
  getPlayerUnit: () => Unit;
  setPlayerUnit: (unit: Unit) => void;
  setTurnInProgress: (val: boolean) => void;
  isTurnInProgress: () => boolean;
  getElapsedTime: () => Seconds;

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
  private startTime: Date | null;
  private endTime: Date | null;
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private levelUpScreen: LevelUpScreenState | null;
  private inventoryState: InventoryState | null;
  private shrineMenuState: ShrineMenuState | null;
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
    this.shrineMenuState = null;
    this._isTurnInProgress = false;
    this.playerUnit = null;
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
    this.startTime = null;
    this.endTime = null;
  }

  startGameTimer = (): void => {
    this.startTime = new Date();
  };

  endGameTimer = (): void => {
    this.endTime = new Date();
  };

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

  /** TODO put the logic somewhere else */
  initShrineMenu = () => {
    const options = [];
    const playerUnit = checkNotNull(this.playerUnit);
    const learnableAbilityNames = playerUnit.getCurrentlyLearnableAbilities();
    const selectedAbilityNames = sample(
      learnableAbilityNames,
      Math.min(learnableAbilityNames.length, 1)
    );

    for (const abilityName of selectedAbilityNames) {
      const onUse = async (state: GameState) => {
        // TODO - centralize this logic, it's copy-pasted
        playerUnit.learnAbility(UnitAbility.abilityForName(abilityName));
        if (Feature.isEnabled(Feature.LEVEL_UP_SCREEN)) {
          playerUnit.spendAbilityPoint();
        }
        this.getTicker().log(`Learned ${AbilityName.localize(abilityName)}.`, {
          turn: this.getTurn()
        });
        // TODO
        state.getSoundPlayer().playSound(Sounds.USE_POTION);
      };
      options.push({
        label: abilityName,
        onUse
      }); // TODO localize
    }
    options.push({
      label: '+2 Mana',
      onUse: async (state: GameState) => {
        playerUnit.increaseMaxMana(2);
        // TODO
        state.getSoundPlayer().playSound(Sounds.USE_POTION);
      }
    });
    options.push({
      label: '+5 Life',
      onUse: async (state: GameState) => {
        playerUnit.increaseMaxLife(5);
        // TODO
        state.getSoundPlayer().playSound(Sounds.USE_POTION);
      }
    });

    this.shrineMenuState = new ShrineMenuState({
      options
    });
  };

  getShrineMenuState = (): ShrineMenuState => checkNotNull(this.shrineMenuState);

  isShowingShrineMenu = (): boolean => this.shrineMenuState !== null;
  closeShrineMenu = (): void => {
    this.shrineMenuState = null;
  };

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

  getElapsedTime = (): number => {
    const startTime = checkNotNull(this.startTime);
    const endTime = this.endTime ?? new Date();
    const milliseconds = endTime.getTime() - startTime.getTime();
    return milliseconds / 1000;
  };
}
