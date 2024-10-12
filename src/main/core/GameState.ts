import { InventoryState } from '@main/core/state/InventoryState';
import { SceneName } from '../scenes/SceneName';
import Unit from '../units/Unit';
import { check, checkNotNull } from '@lib/utils/preconditions';
import { Seconds } from '@lib/utils/time';
import { ShrineMenuState } from '@main/core/state/ShrineMenuState';
import { Scene } from '@main/scenes/Scene';
import { clear } from '@lib/utils/arrays';
import { Faction } from '@main/units/Faction';
import MapInstance from '@main/maps/MapInstance';
import { GameOverState } from '@main/core/state/GameOverState';

export interface GameState {
  startGameTimer: () => void;
  endGameTimer: () => void;
  getScenes: () => Scene[];
  addScene: (scene: Scene) => void;
  getCurrentScene: () => Scene | null;
  setScene: (sceneName: SceneName) => void;
  showPrevScene: () => void;
  setShrineMenuState: (shrineMenuState: ShrineMenuState | null) => void;
  getShrineMenuState: () => ShrineMenuState | null;
  isShowingShrineMenu: () => boolean;
  getInventoryState: () => InventoryState | null;
  setInventoryState: (inventoryState: InventoryState | null) => void;
  getGameOverState: () => GameOverState | null;
  setGameOverState: (gameOverState: GameOverState | null) => void;
  reset: () => void;
  setTurnInProgress: (val: boolean) => void;
  isTurnInProgress: () => boolean;
  getElapsedTime: () => Seconds;

  getTurn: () => number;
  nextTurn: () => void;

  getMap: (id: string) => MapInstance | null;
  addMap: (map: MapInstance) => void;

  getUnits: () => Unit[];
  getPlayerUnit: () => Unit;
  addUnit: (unit: Unit) => void;
  removeUnit: (unit: Unit) => void;

  getGeneratedEquipmentIds: () => string[];
  recordEquipmentGenerated: (equipmentId: string) => void;
}

export class GameStateImpl implements GameState {
  private startTime: Date | null;
  private endTime: Date | null;
  private readonly scenes: Scene[];
  private currentScene: Scene | null;
  private prevScene: Scene | null;
  private inventoryState: InventoryState | null;
  private shrineMenuState: ShrineMenuState | null;
  private gameOverState: GameOverState | null;
  private _isTurnInProgress: boolean;
  private turn: number;
  private readonly maps: Record<string, MapInstance>;
  private readonly units: Unit[];
  private readonly generatedEquipmentIds: string[];

  constructor() {
    this.scenes = [];
    this.currentScene = null;
    this.prevScene = null;
    this.inventoryState = null;
    this.shrineMenuState = null;
    this.gameOverState = null;
    this._isTurnInProgress = false;
    this.turn = 1;
    this.startTime = null;
    this.endTime = null;
    this.maps = {};
    this.units = [];
    this.generatedEquipmentIds = [];
  }

  startGameTimer = (): void => {
    this.startTime = new Date();
  };

  endGameTimer = (): void => {
    this.endTime = new Date();
  };

  getScenes = (): Scene[] => this.scenes;
  addScene = (scene: Scene) => this.scenes.push(scene);
  getCurrentScene = (): Scene | null => this.currentScene;
  setScene = (sceneName: SceneName) => {
    // TODO consider indexing by scene name
    this.prevScene = this.currentScene;
    this.currentScene = checkNotNull(this.scenes.find(scene => scene.name === sceneName));
  };

  /**
   * TODO: make this a stack
   */
  showPrevScene = () => {
    if (this.prevScene) {
      this.currentScene = this.prevScene;
      this.prevScene = null;
    } else {
      this.setScene(SceneName.GAME);
    }
  };

  getInventoryState = (): InventoryState | null => this.inventoryState;
  setInventoryState = (inventoryState: InventoryState | null) => {
    this.inventoryState = inventoryState;
  };

  setShrineMenuState = (shrineMenuState: ShrineMenuState | null) => {
    this.shrineMenuState = shrineMenuState;
  };

  getShrineMenuState = (): ShrineMenuState | null => this.shrineMenuState;

  isShowingShrineMenu = (): boolean => this.shrineMenuState !== null;

  getGameOverState = (): GameOverState | null => this.gameOverState;
  setGameOverState = (gameOverState: GameOverState | null) => {
    this.gameOverState = gameOverState;
  };

  reset = (): void => {
    this.currentScene = null;
    this.prevScene = null;
    this.turn = 1;
    Object.keys(this.maps).forEach(key => {
      delete this.maps[key];
    });
    this.shrineMenuState = null;
    this.inventoryState = null;
    this.gameOverState = null;
    clear(this.units);
    clear(this.generatedEquipmentIds);
  };

  setTurnInProgress = (val: boolean) => {
    this._isTurnInProgress = val;
  };

  /**
   * Used for showing the "busy" indicator in the UI
   */
  isTurnInProgress = (): boolean => this._isTurnInProgress;

  getTurn = () => this.turn;
  nextTurn = () => {
    this.turn++;
  };

  getElapsedTime = (): number => {
    const startTime = checkNotNull(this.startTime);
    const endTime = this.endTime ?? new Date();
    const milliseconds = endTime.getTime() - startTime.getTime();
    return milliseconds / 1000;
  };

  getMap = (id: string): MapInstance | null => {
    return this.maps[id] ?? null;
  };

  addMap = (map: MapInstance) => {
    check(!this.maps[map.id]);
    this.maps[map.id] = map;
  };

  getUnits = (): Unit[] => this.units;

  getPlayerUnit = (): Unit =>
    checkNotNull(this.units.find(u => u.getFaction() === Faction.PLAYER));

  addUnit = (unit: Unit) => this.units.push(unit);

  removeUnit = (unit: Unit) => {
    const index = this.units.indexOf(unit);
    check(index >= 0);
    this.units.splice(index, 1);
  };

  getGeneratedEquipmentIds = (): string[] => this.generatedEquipmentIds;

  recordEquipmentGenerated = (equipmentId: string) => {
    this.generatedEquipmentIds.push(equipmentId);
  };
}
