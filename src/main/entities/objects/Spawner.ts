import GameObject, { ObjectType } from './GameObject';
import Unit from '../units/Unit';
import MapInstance from '../../maps/MapInstance';
import { Sprite } from '@main/graphics/sprites/Sprite';
import { Session } from '@main/core/Session';
import { GameState } from '@main/core/GameState';
import { Coordinates } from '@main/geometry';

export enum SpawnerState {
  ALIVE = 'ALIVE',
  DEAD = 'DEAD'
}

export namespace SpawnerState {
  export const values = (): SpawnerState[] => [SpawnerState.ALIVE, SpawnerState.DEAD];
}

type SpawnFunction = (coordinates: Coordinates) => Promise<Unit>;

type Props = Readonly<{
  spawnFunction: SpawnFunction;
  sprite: Sprite;
  coordinates: Coordinates;
  map: MapInstance;
  cooldown: number;
  maxUnits: number;
  isBlocking: boolean;
}>;

export default class Spawner extends GameObject {
  private readonly spawnFunction: SpawnFunction;
  private _state: SpawnerState;
  private readonly maxCooldown: number;
  private cooldown: number = 0;
  private readonly maxUnits: number;
  private readonly spawnedUnits: Set<Unit>;
  private readonly _isBlocking: boolean;

  constructor({
    spawnFunction,
    coordinates,
    map,
    sprite,
    cooldown,
    maxUnits,
    isBlocking
  }: Props) {
    super({
      coordinates,
      map,
      objectType: ObjectType.SPAWNER,
      sprite
    });
    this.spawnFunction = spawnFunction;
    this.maxCooldown = cooldown;
    this.maxUnits = maxUnits;
    this.cooldown = 0;
    this.spawnedUnits = new Set<Unit>();
    this._state = SpawnerState.ALIVE;
    this._isBlocking = isBlocking;
  }

  playTurnAction = async (state: GameState, session: Session) => {
    if (this._state === 'DEAD') {
      return;
    }

    this.cooldown = Math.max(this.cooldown - 1, 0);

    const map = session.getMap();
    for (const spawnedUnit of [...this.spawnedUnits]) {
      if (!map.unitExists(spawnedUnit)) {
        this.spawnedUnits.delete(spawnedUnit);
      }
    }

    const numSpawnedUnits = this.spawnedUnits.size;
    if (this.cooldown <= 0 && numSpawnedUnits < this.maxUnits) {
      const { x, y } = this.getCoordinates();
      if (map.getUnit({ x, y }) === null) {
        const spawnedUnit = await this.spawnFunction({ x, y });
        this.cooldown = this.maxCooldown;
        map.addUnit(spawnedUnit);
        this.spawnedUnits.add(spawnedUnit);
      }
    }
  };

  getState = (): SpawnerState => this._state;

  setState = (state: SpawnerState) => {
    this._state = state;
  };

  isBlocking = () => this._isBlocking && this._state === SpawnerState.ALIVE;
}
