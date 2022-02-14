import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { GameScreen } from '../types/types';
import Unit from '../units/Unit';
import UnitAbility from '../units/UnitAbility';

let INSTANCE: GameState | null = null;

type Props = {
  playerUnit: Unit,
  maps: MapSpec[]
};

/**
 * Global mutable state
 */
class GameState {
  screen: GameScreen;
  playerUnit: Unit;
  readonly maps: MapSpec[];
  mapIndex: number | null;
  readonly messages: string[];
  turn: number;
  queuedAbility: UnitAbility | null;
  private _map: MapInstance | null;

  constructor({ playerUnit, maps }: Props) {
    this.screen = GameScreen.TITLE;
    this.playerUnit = playerUnit;
    this.maps = maps;
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
