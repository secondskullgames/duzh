import { ItemCategory, GameScreen } from '../types';
import Unit from './Unit';
import MapSupplier from './MapSupplier';
import MapInstance from './MapInstance';

class GameState {
  screen: GameScreen;
  playerUnit: Unit;
  mapSuppliers: MapSupplier[];
  mapIndex: number | null;
  private _map: MapInstance | null;
  messages: string[];
  inventoryCategory: ItemCategory | null;
  inventoryIndex: number;
  turn: number;

  constructor(playerUnit: Unit, mapSuppliers: MapSupplier[]) {
    this.screen = GameScreen.GAME;
    this.playerUnit = playerUnit;
    this.mapSuppliers = mapSuppliers;
    this.mapIndex = 0;
    this._map = null;
    this.messages = [];
    this.inventoryCategory = null;
    this.inventoryIndex = 0;
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