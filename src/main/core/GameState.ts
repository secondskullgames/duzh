import { GameScreen } from './GameScreen';
import MapInstance from '../maps/MapInstance';
import Unit from '../entities/units/Unit';
import { type UnitAbility } from '../entities/units/abilities/UnitAbility';
import { checkArgument, checkNotNull, checkState } from '../utils/preconditions';
import { MapSupplier } from '../maps/MapSupplier';
import { clear } from '../utils/arrays';
import { AbilityName } from '../entities/units/abilities/AbilityName';

/**
 * Global mutable state
 */
export default class GameState {
  private screen: GameScreen;
  private prevScreen: GameScreen | null;
  private playerUnit: Unit | null;
  private readonly mapSuppliers: MapSupplier[];
  private readonly maps: Record<number, MapInstance>;
  private mapIndex: number;
  private map: MapInstance | null;
  private turn: number;
  private queuedAbility: UnitAbility | null;
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.screen = GameScreen.NONE;
    this.prevScreen = null;
    this.playerUnit = null;
    this.mapSuppliers = [];
    this.maps = [];
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
    this.generatedEquipmentIds = [];
  }

  getScreen = (): GameScreen => this.screen;
  setScreen = (screen: GameScreen) => {
    this.prevScreen = this.screen;
    this.screen = screen;
  };
  /**
   * TODO: make this a stack
   */
  showPrevScreen = () => {
    if (this.prevScreen) {
      this.screen = this.prevScreen;
      this.prevScreen = null;
    } else {
      this.screen = GameScreen.GAME;
    }
  };

  getPlayerUnit = (): Unit => checkNotNull(this.playerUnit);
  setPlayerUnit = (unit: Unit): void => {
    checkState(this.playerUnit === null);
    this.playerUnit = unit;
  };

  hasNextMap = () => this.mapIndex < this.mapSuppliers.length - 1;
  getMapIndex = () => this.mapIndex;

  setMapIndex = async (mapIndex: number): Promise<MapInstance> => {
    checkArgument(mapIndex >= 0 && mapIndex < this.mapSuppliers.length);
    this.mapIndex = mapIndex;
    if (!this.maps[mapIndex]) {
      const mapSupplier = this.mapSuppliers[this.mapIndex];
      const map = await mapSupplier();
      this.maps[mapIndex] = map;
      this.map = map;
    }
    return this.maps[mapIndex];
  };

  addMaps = (suppliers: MapSupplier[]) => {
    this.mapSuppliers.push(...suppliers);
  };

  getMap = (): MapInstance =>
    checkNotNull(this.map, 'Tried to retrieve map before map was loaded');

  setMap = (map: MapInstance) => {
    this.map = map;
  };

  getTurn = () => this.turn;
  nextTurn = () => {
    this.turn++;
  };

  getQueuedAbility = (): UnitAbility | null => this.queuedAbility;
  setQueuedAbility = (ability: UnitAbility | null) => {
    this.queuedAbility = ability;
  };

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };

  reset = () => {
    this.screen = GameScreen.TITLE;
    this.prevScreen = null;
    this.playerUnit = null;
    clear(this.mapSuppliers);
    Object.keys(this.maps).forEach(key => {
      delete this.maps[parseInt(key)];
    });
    this.mapIndex = -1;
    this.map = null;
    this.turn = 1;
    this.queuedAbility = null;
    clear(this.generatedEquipmentIds);
  };
}
