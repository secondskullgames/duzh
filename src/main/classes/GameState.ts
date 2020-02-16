import { ItemCategory, GameScreen } from '../types';
import Unit from './Unit';
import MapSupplier from './MapSupplier';
import MapInstance from './MapInstance';

class GameState {
  screen: GameScreen;
  playerUnit: Unit;
  mapSuppliers: MapSupplier[];
  mapIndex: number | null;
  map: MapInstance | null;
  messages: string[];
  inventoryCategory: ItemCategory | null;
  inventoryIndex: number;
  turn: number;

  constructor(playerUnit, mapSuppliers) {
    this.screen = GameScreen.GAME;
    this.playerUnit = playerUnit;
    this.mapSuppliers = mapSuppliers;
    this.mapIndex = 0;
    this.map = null;
    this.messages = [];
    this.inventoryCategory = null;
    this.inventoryIndex = 0;
    this.turn = 1;
  }
}

export default GameState;