import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { GameScreen } from '../types/types';
import Unit from '../units/Unit';
import UnitAbility from '../units/UnitAbility';
import { clear as clearArray } from '../utils/arrays';
import Messages from './Messages';

let INSTANCE: GameState | null = null;

type Props = {
  playerUnit: Unit,
  maps: MapSpec[]
};

/**
 * Global mutable state
 */
class GameState {
  private screen: GameScreen;
  playerUnit: Unit;
  readonly maps: MapSpec[];
  mapIndex: number | null;
  private readonly _messages: Messages;
  turn: number;
  queuedAbility: UnitAbility | null;
  private _map: MapInstance | null;

  constructor({ playerUnit, maps }: Props) {
    this.screen = 'TITLE';
    this.playerUnit = playerUnit;
    this.maps = maps;
    this.mapIndex = 0;
    this._map = null;
    this._messages = new Messages();
    this.turn = 1;
    this.queuedAbility = null;
  }

  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => { this.screen = screen; };

  getMap = (): MapInstance => {
    if (!this._map) {
      throw new Error('Tried to retrieve map before map was loaded');
    }
    return this._map;
  };

  setMap = (map: MapInstance) => { this._map = map; };
  getMessages = (): string[] => this._messages.getRecentMessages(3);
  pushMessage = (message: string): void => { this._messages.pushMessage(message); };

  static setInstance = (state: GameState) => { INSTANCE = state; };
  static getInstance = (): GameState => INSTANCE!!;
}

export default GameState;
