import { Renderer } from '../graphics/renderers/Renderer';
import MapInstance from '../maps/MapInstance';
import Music from '../sounds/Music';
import { playSound } from '../sounds/SoundFX';
import Sounds from '../sounds/Sounds';
import Unit from '../entities/units/Unit';
import UnitAbility from '../entities/units/abilities/UnitAbility';
import { sortBy } from '../utils/arrays';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';
import { sleep } from '../utils/promises';
import MapItem from '../entities/objects/MapItem';
import InventoryItem from '../items/InventoryItem';
import { Animation } from '../graphics/animations/Animation';
import Equipment from '../equipment/Equipment';
import Timer from '../utils/Timer';
import UnitService from '../entities/units/UnitService';

let INSTANCE: GameEngine | null = null;

type Props = Readonly<{
  renderer: Renderer,
  state: GameState
}>;

export class GameEngine {
  private readonly renderer: Renderer;
  private readonly state: GameState;
  private readonly timer: Timer;

  private firstMapPromise: Promise<MapInstance> | null;

  constructor({ state, renderer }: Props) {
    this.renderer = renderer;
    this.state = state;
    this.firstMapPromise = null;
    this.timer = Timer.start();
  }

  preloadFirstMap = async () => {
    this.firstMapPromise = this.state.loadNextMap();
    await this.firstMapPromise;
  };

  startGame = async () => {
    const t1 = new Date().getTime();
    const firstMap = await checkNotNull(this.firstMapPromise);
    this.state.setMap(firstMap);
    Music.stop();
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    this._updateRevealedTiles();
    await this.render();
    const t2 = new Date().getTime();
    console.debug(`Loaded level in ${t2 - t1} ms`);
  };

  startGameDebug = async (mapInstance: MapInstance) => {
    console.log('debug mode');
    this.state.setMap(mapInstance);
    Music.stop();
    // Music.playFigure(Music.TITLE_THEME);
    // Music.playSuite(randChoice([SUITE_1, SUITE_2, SUITE_3]));
    this._updateRevealedTiles();
    await this.render();
  };

  gameOver = async () => {
    this.state.setScreen('GAME_OVER');
    Music.stop();
    playSound(Sounds.GAME_OVER);
  };

  playTurn = async () => {
    const { state } = this;
    const map = state.getMap();

    const sortedUnits = _sortUnits(map.getAllUnits());
    for (const unit of sortedUnits) {
      await unit.update();
    }

    for (const object of map.getAllObjects()) {
      await object.update();
    }

    this._updateRevealedTiles();
    await this.render();
    state.nextTurn();
  };

  render = async () => {
    const t = this.timer;
    t.start('render');
    await this.renderer.render();
    t.log('render');
    const e = document.getElementById('fps')!;
    const fps = 1000 / t.getAverageMillis('render');
    e.innerText = `${fps.toFixed(2)}`;
  }

  loadNextMap = async () => {
    const { state } = this;
    if (!state.hasNextMap()) {
      Music.stop();
      state.setScreen('VICTORY');
    } else {
      const t1 = new Date().getTime();
      const nextMap = await state.loadNextMap();
      state.setMap(nextMap);
      this._updateRevealedTiles();
      if (nextMap.music) {
        await Music.playMusic(nextMap.music);
      }
      const t2 = new Date().getTime();
      console.debug(`Loaded level in ${t2 - t1} ms`);
    }
  };

  /**
   * Add any tiles the player can currently see to the map's revealed tiles list.
   */
  private _updateRevealedTiles = () => {
    const { state } = this;
    const playerUnit = state.getPlayerUnit();
    const map = state.getMap();

    const radius = 3;

    const { x: playerX, y: playerY } = playerUnit.getCoordinates();
    for (let y = playerY - radius; y <= playerY + radius; y++) {
      for (let x = playerX - radius; x <= playerX + radius; x++) {
        if (!map.isTileRevealed({ x, y })) {
          map.revealTile({ x, y });
        }
      }
    }
  };

  dealDamage = async (baseDamage: number, params: DealDamageParams) => {
    const { state } = this;

    const map = state.getMap();
    const playerUnit = state.getPlayerUnit();

    const sourceUnit = params.sourceUnit ?? null;
    const targetUnit = params.targetUnit;
    const adjustedDamage = targetUnit.takeDamage(baseDamage, sourceUnit);
    sourceUnit?.refreshCombat();
    targetUnit.refreshCombat();

    if (sourceUnit) {
      const ability = params?.ability ?? null;
      // note: we're logging adjustedDamage here since, if we "overkilled",
      // we still want to give you "credit" for the full damage amount
      if (ability) {
        const message = ability.getDamageLogMessage(sourceUnit, targetUnit, adjustedDamage);
        state.logMessage(message);
      } else {
        state.logMessage(`${sourceUnit.getName()} hit ${targetUnit.getName()} for ${adjustedDamage} damage!`);
      }
    }

    if (targetUnit.getLife() <= 0) {
      map.removeUnit(targetUnit);
      if (targetUnit === playerUnit) {
        await this.gameOver();
        return;
      } else {
        playSound(Sounds.ENEMY_DIES);
        state.logMessage(`${targetUnit.getName()} dies!`);
      }

      if (sourceUnit === playerUnit) {
        UnitService.getInstance().awardExperience(sourceUnit, 1);
      }
    }
  };

  playAnimation = async (animation: Animation) => {
    const { frames } = animation;
    const map = this.state.getMap();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      for (const projectile of (frame.projectiles ?? [])) {
        map.projectiles.add(projectile);
      }
      for (let j = 0; j < frame.units.length; j++) {
        const { unit, activity, frameNumber, direction } = frame.units[j];
        unit.setActivity(activity, frameNumber ?? 1, direction ?? unit.getDirection());
      }

      await this.render();

      if (!!frame.postDelay) {
        console.log(`sleep ${frame.postDelay}`);
        await sleep(frame.postDelay);
      }

      for (const projectile of (frame.projectiles ?? [])) {
        map.removeProjectile(projectile);
      }
    }
  };

  static setInstance = (instance: GameEngine) => { INSTANCE = instance; };
  /** @deprecated */
  static getInstance = (): GameEngine => checkNotNull(INSTANCE);
}

/**
 * Sort the list of units such that the player unit is first in the order,
 * and other units appear in unspecified order
 */
const _sortUnits = (units: Unit[]): Unit[] => sortBy(
  units,
  unit => (unit.getFaction() === 'PLAYER') ? 0 : 1
);

type DealDamageParams = Readonly<{
  sourceUnit?: Unit,
  targetUnit: Unit,
  ability?: UnitAbility
}>;
