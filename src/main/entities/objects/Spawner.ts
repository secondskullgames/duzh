import GameState from '../../core/GameState';
import Sprite from '../../graphics/sprites/Sprite';
import Animatable from '../../graphics/animations/Animatable';
import GameObject from './GameObject';
import Unit from '../units/Unit';
import UnitFactory from '../units/UnitFactory';
import HumanDeterministicController from '../units/controllers/HumanDeterministicController';
import Coordinates from '../../geometry/Coordinates';

export type SpawnerState = 'ALIVE' | 'DEAD';
export namespace SpawnerState {
  export const values = (): SpawnerState[] => ['ALIVE', 'DEAD'];
}

type SpawnFunction = (coordinates: Coordinates) => Promise<Unit>;

type Props = Readonly<{
  spawnFunction: SpawnFunction,
  sprite: Sprite,
  coordinates: Coordinates,
  cooldown: number,
  maxUnits: number,
  isBlocking: boolean
}>;

export default class Spawner extends GameObject implements Animatable {
  private readonly spawnFunction: SpawnFunction;
  private state: SpawnerState;
  private readonly maxCooldown: number;
  private cooldown: number = 0;
  private readonly maxUnits: number;
  private readonly spawnedUnits: Set<Unit>;
  private readonly _isBlocking: boolean;

  constructor({ spawnFunction, coordinates, sprite, cooldown, maxUnits, isBlocking }: Props) {
    super({
      coordinates,
      objectType: 'spawner',
      sprite
    });
    this.spawnFunction = spawnFunction;
    this.maxCooldown = cooldown;
    this.maxUnits = maxUnits;
    this.cooldown = 0;
    this.spawnedUnits = new Set<Unit>();
    this.state = 'ALIVE';
    this._isBlocking = isBlocking;
  }

  getAnimationKey = (): string => `${this.state.toLowerCase()}`;

  update = async () => {
    if (this.state === 'DEAD') {
      return;
    }

    this.cooldown = Math.max(this.cooldown - 1, 0);

    const state = GameState.getInstance();
    const map = state.getMap();
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

  setState = (state: SpawnerState) => { this.state = state; };

  isBlocking = () => this._isBlocking && this.state === 'ALIVE';
}
