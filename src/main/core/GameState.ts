import MapInstance from '../maps/MapInstance';
import MapSpec from '../maps/MapSpec';
import { GameScreen } from '../types/types';
import Unit from '../units/Unit';
import UnitAbility from '../units/UnitAbility';
import { checkNotNull } from '../utils/preconditions';
import Messages from './Messages';
import { MapSupplier } from '../maps/MapSupplier';

let INSTANCE: GameState | null = null;

type Props = {
  playerUnit: Unit,
  maps: MapSupplier[]
};

/**
 * Global mutable state
 */
class GameState {
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private readonly playerUnit: Unit;
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: MapInstance[];
  private mapIndex: number;
  private readonly messages: Messages;
  private turn: number;
  private queuedAbility: UnitAbility | null;
  private map: MapInstance | null;

  constructor({ playerUnit, maps }: Props) {
    this.screen = 'TITLE';
    this.playerUnit = playerUnit;
    this.mapSuppliers = maps;
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

  getPlayerUnit = (): Unit => this.playerUnit;

  hasNextMap = () => this.mapIndex < (this.mapSuppliers.length - 1);
  getMapIndex = () => this.mapIndex;
  getNextMap = async (): Promise<MapInstance> => {
    this.mapIndex++;
    const mapSupplier = this.mapSuppliers[this.mapIndex];
    const map = await mapSupplier();
    this.maps.push(map);
    return map;
  };

  getMap = (): MapInstance => checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  setMap = (map: MapInstance) => { this.map = map; };

  getTurn = () => this.turn;
  nextTurn = () => { this.turn++; };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };

  getMessages = (): string[] => this.messages.getRecentMessages();
  logMessage = (message: string): void => {
    this.messages.log(message);
  };

  static setInstance = (state: GameState) => { INSTANCE = state; };
  static getInstance = (): GameState => checkNotNull(INSTANCE);
}

export default GameState;
