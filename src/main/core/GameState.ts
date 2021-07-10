import Unit from '../units/Unit';
import MapBuilder from '../maps/MapBuilder';
import MapInstance from '../maps/MapInstance';
import { GameScreen } from '../types/types';
import UnitAbility from '../units/UnitAbility';

/**
 * Global mutable state
 */
class GameState {
  screen: GameScreen;
  playerUnit: Unit;
  maps: (() => MapBuilder)[];
  mapIndex: number | null;
  private _map: MapInstance | null;
  messages: string[];
  turn: number;
  queuedAbility: UnitAbility | null;

  constructor(playerUnit: Unit, maps: (() => MapBuilder)[]) {
    this.screen = GameScreen.TITLE;
    this.playerUnit = playerUnit;
    this.maps = maps;
    this.mapIndex = 0;
    this._map = null;
    this.messages = [];
    this.turn = 1;
    this.queuedAbility = null;
  }

  getMap(): MapInstance {
    if (!this._map) {
      throw 'Tried to retrieve map before map was loaded';
    }
    return this._map;
  }

  setMap(map: MapInstance) {
    this._map = map;
  }
}

export default GameState;
