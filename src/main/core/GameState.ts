import { GameScreen } from '../types/types';
import Unit from '../units/Unit';
import MapSupplier from '../maps/MapSupplier';
import MapInstance from '../maps/MapInstance';

class GameState {
  screen: GameScreen;
  playerUnit: Unit;
  mapSuppliers: MapSupplier[];
  mapIndex: number | null;
  private _map: MapInstance | null;
  messages: string[];
  turn: number;

  constructor(playerUnit: Unit, mapSuppliers: MapSupplier[]) {
    this.screen = GameScreen.GAME;
    this.playerUnit = playerUnit;
    this.mapSuppliers = mapSuppliers;
    this.mapIndex = 0;
    this._map = null;
    this.messages = [];
    this.turn = 1;
  }

  getMap(): MapInstance {
    if (!this._map) {
      throw `fux`;
    }
    return this._map;
  }

  setMap(map: MapInstance) {
    this._map = map;
  }
}

export default GameState;