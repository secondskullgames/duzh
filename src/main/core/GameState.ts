import MapInstance from '../maps/MapInstance';
import { GameScreen } from '../types/types';
import Unit from '../entities/units/Unit';
import UnitAbility from '../entities/units/abilities/UnitAbility';
import { checkNotNull, checkState } from '../utils/preconditions';
import Messages from './Messages';
import { MapSupplier } from '../maps/MapSupplier';
import { clear } from '../utils/arrays';

/**
 * Global mutable state
 */
export default class GameState {
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private playerUnit: Unit | null;
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: MapInstance[];
  private mapIndex: number;
  private map: MapInstance | null;
  private readonly messages: Messages;
  private turn: number;
  private queuedAbility: UnitAbility | null;

  constructor() {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
    this.playerUnit = null;
    this.mapSuppliers = [];
    this.maps = [];
    this.mapIndex = -1;
    this.map = null;
    this.messages = new Messages();
    this.turn = 1;
    this.queuedAbility = null;
  }

  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => {
    this.prevScreen = this.screen;
    this.screen = screen;
  };
  showPrevScreen = () => {
    if (this.prevScreen) {
      this.screen = this.prevScreen;
      this.prevScreen = null;
    }
  };

  getPlayerUnit = (): Unit => checkNotNull(this.playerUnit);
  setPlayerUnit = (unit: Unit): void => {
    checkState(this.playerUnit === null);
    this.playerUnit = unit;
  };

  hasNextMap = () => this.mapIndex < (this.mapSuppliers.length - 1);
  getMapIndex = () => this.mapIndex;
  loadNextMap = async (): Promise<MapInstance> => {
    this.mapIndex++;
    checkState(this.mapIndex < this.mapSuppliers.length);
    const mapSupplier = this.mapSuppliers[this.mapIndex];
    const map = await mapSupplier();
    this.maps.push(map);
    return map;
  };

  addMaps = (suppliers: MapSupplier[]) => {
    this.mapSuppliers.push(...suppliers);
  };

  getMap = (): MapInstance => checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  setMap = (map: MapInstance) => {
    this.map = map;
  };

  getTurn = () => this.turn;
  nextTurn = () => { this.turn++; };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };

  getMessages = (): Messages => {
    return this.messages;
  }

  reset = () => {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
    this.playerUnit = null;
    clear(this.mapSuppliers);
    clear(this.maps);
    this.mapIndex = -1;
    this.map = null;
    this.messages.clear();
    this.turn = 1;
    this.queuedAbility = null;
  };

  private static INSTANCE: GameState | null = null;
  static setInstance = (state: GameState) => { GameState.INSTANCE = state; };
  static getInstance = (): GameState => checkNotNull(GameState.INSTANCE);
}
