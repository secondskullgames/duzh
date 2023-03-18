import GameState from '../../core/GameState';
import Sprite from '../../graphics/sprites/Sprite';
import Animatable from '../../graphics/animations/Animatable';
import Object from './Object';
import Unit from '../units/Unit';
import UnitFactory from '../units/UnitFactory';
import HumanDeterministicController from '../units/controllers/HumanDeterministicController';

export type SpawnerState = 'ALIVE' | 'DEAD';
export namespace SpawnerState {
  export const values = (): SpawnerState[] => ['ALIVE', 'DEAD'];
}

type Props = Readonly<{
  sprite: Sprite,
  x: number,
  y: number,
  cooldown: number,
  unitClass: string,
  maxUnits: number,
  isBlocking: boolean
}>;

export default class Spawner extends Object implements Animatable {
  private state: SpawnerState;
  private readonly maxCooldown: number;
  private cooldown: number = 0;
  private readonly unitClass: string;
  private readonly maxUnits: number;
  private readonly spawnedUnits: Set<Unit>;
  private readonly _isBlocking: boolean;

  constructor({ x, y, sprite, cooldown, unitClass, maxUnits, isBlocking }: Props) {
    super({
      coordinates: { x, y },
      sprite
    });
    this.maxCooldown = cooldown;
    this.unitClass = unitClass;
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
        const spawnedUnit = await UnitFactory.getInstance().createUnit({
          unitClass: this.unitClass,
          coordinates: { x, y },
          level: 1,
          controller: new HumanDeterministicController({ state }),
          faction: 'ENEMY'
        });
        this.cooldown = this.maxCooldown;
        map.addUnit(spawnedUnit);
        this.spawnedUnits.add(spawnedUnit);
      }
    }
  };

  setState = (state: SpawnerState) => { this.state = state; };

  isBlocking = () => this._isBlocking && this.state === 'ALIVE';
}
