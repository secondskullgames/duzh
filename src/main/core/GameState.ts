import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { GameScreen } from '../types/types';
import Unit from '../units/Unit';
import UnitAbility from '../units/UnitAbility';
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
  private readonly _playerUnit: Unit;
  private readonly maps: MapSpec[];
  private mapIndex: number;
  private readonly _messages: Messages;
  private _turn: number;
  private _queuedAbility: UnitAbility | null;
  private _map: MapInstance | null;

  constructor({ playerUnit, maps }: Props) {
    this.screen = 'TITLE';
    this._playerUnit = playerUnit;
    this.maps = maps;
    this.mapIndex = -1;
    this._map = null;
    this._messages = new Messages();
    this._turn = 1;
    this._queuedAbility = null;
  }

  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => { this.screen = screen; };

  getPlayerUnit = (): Unit => this._playerUnit;

  hasNextMap = () => this.mapIndex < (this.maps.length - 1);
  getMapIndex = () => this.mapIndex;
  getNextMap = (): MapSpec => {
    const mapSpec = this.maps[this.mapIndex + 1];
    this.mapIndex++;
    return mapSpec;
  };

  getMap = (): MapInstance => {
    if (!this._map) {
      throw new Error('Tried to retrieve map before map was loaded');
    }
    return this._map;
  };

  setMap = (map: MapInstance) => { this._map = map; };

  getTurn = () => this._turn;
  nextTurn = () => { this._turn++; };

  getQueuedAbility = () => this._queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => { this._queuedAbility = ability; };

  getMessages = (): string[] => this._messages.getRecentMessages(3);
  pushMessage = (message: string): void => { this._messages.pushMessage(message); };

  static setInstance = (state: GameState) => { INSTANCE = state; };
  static getInstance = (): GameState => INSTANCE!!;
}

export default GameState;
