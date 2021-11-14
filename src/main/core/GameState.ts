import Unit from '../units/Unit';
import MapBuilder from '../maps/MapBuilder';
import MapInstance from '../maps/MapInstance';
import { GameScreen } from '../types/types';
import UnitAbility from '../units/UnitAbility';

let INSTANCE: GameState | null = null;

/**
 * Global mutable state
 */
class GameState {
  screen: GameScreen;
  playerUnit: Unit;
  readonly mapIds: string[];
  mapIndex: number | null;
  readonly messages: string[];
  turn: number;
  queuedAbility: UnitAbility | null;
  private _map: MapInstance | null;

  constructor(playerUnit: Unit, mapIds: string[]) {
    this.screen = GameScreen.TITLE;
    this.playerUnit = playerUnit;
    this.mapIds = mapIds;
    this.mapIndex = 0;
    this._map = null;
    this.messages = [];
    this.turn = 1;
    this.queuedAbility = null;
  }

  getMap = (): MapInstance => {
    if (!this._map) {
      throw new Error('Tried to retrieve map before map was loaded');
    }
    return this._map;
  };

  setMap = (map: MapInstance) => { this._map = map; };

  static setInstance = (state: GameState) => { INSTANCE = state; };
  static getInstance = (): GameState => INSTANCE!!;
}

export default GameState;
