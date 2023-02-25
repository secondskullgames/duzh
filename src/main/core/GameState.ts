import MapInstance from '../maps/MapInstance';
import { GameScreen } from '../types/types';
import Unit from '../units/Unit';
import UnitAbility from '../units/abilities/UnitAbility';
import { checkNotNull, checkState } from '../utils/preconditions';
import Messages from './Messages';
import { MapSupplier } from '../maps/MapSupplier';

let INSTANCE: GameState | null = null;

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
  private readonly messages: Messages;
  private turn: number;
  private queuedAbility: UnitAbility | null;
  private map: MapInstance | null;

  constructor() {
    this.screen = 'TITLE';
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
    const mapSupplier = this.mapSuppliers[this.mapIndex];
    const map = await mapSupplier();
    this.maps.push(map);
    return map;
  };

  addMaps = (suppliers: MapSupplier[]) => {
    this.mapSuppliers.push(...suppliers);
  };

  getMap = (): MapInstance => checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  setMap = (map: MapInstance) => { this.map = map; };

  getTurn = () => this.turn;
  nextTurn = () => { this.turn++; };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };

  getMessages = (): string[] => {
    return this.messages.getRecentMessages(this.turn);
  }
  logMessage = (message: string): void => {
    this.messages.log(message, this.turn);
  };

  static setInstance = (state: GameState) => { INSTANCE = state; };
  /**
   * @deprecated
   */
  static getInstance = (): GameState => checkNotNull(INSTANCE);
}
