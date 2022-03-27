import GameState from '../core/GameState';
import Sprite from '../graphics/sprites/Sprite';
import Animatable from '../types/Animatable';
import { Entity } from '../types/types';
import { HUMAN_DETERMINISTIC } from '../units/controllers/AIUnitControllers';
import Unit from '../units/Unit';
import UnitClass from '../units/UnitClass';
import UnitFactory from '../units/UnitFactory';

type SpawnerState = 'ALIVE' | 'DEAD';
namespace SpawnerState {
  export const values = (): SpawnerState[] => ['ALIVE', 'DEAD'];
}

type Props = {
  sprite: Sprite,
  x: number,
  y: number,
  cooldown: number,
  unitClass: UnitClass,
  maxUnits: number,
  isBlocking: boolean
};

class Spawner implements Entity, Animatable {
  private readonly sprite: Sprite;
  private state: SpawnerState;
  private readonly maxCooldown: number;
  private cooldown: number = 0;
  private readonly unitClass: UnitClass;
  private readonly maxUnits: number;
  private readonly spawnedUnits: Set<Unit>;
  private readonly _isBlocking: boolean;
  x: number;
  y: number;

  constructor({ x, y, sprite, cooldown, unitClass, maxUnits, isBlocking }: Props) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.maxCooldown = cooldown;
    this.unitClass = unitClass;
    this.maxUnits = maxUnits;
    this.cooldown = 0;
    this.spawnedUnits = new Set<Unit>();
    this.state = 'ALIVE';
    this._isBlocking = isBlocking;
  }

  getAnimationKey = (): string => `${this.state.toLowerCase()}`;

  getSprite = (): Sprite => this.sprite;

  update = async () => {
    if (this.state === 'DEAD') return;

    this.cooldown = Math.max(this.cooldown - 1, 0);

    const map = GameState.getInstance().getMap();
    for (const spawnedUnit of [...this.spawnedUnits]) {
      if (!map.unitExists(spawnedUnit)) {
        this.spawnedUnits.delete(spawnedUnit);
      }
    }

    const numSpawnedUnits = this.spawnedUnits.size;
    if (this.cooldown <= 0 && numSpawnedUnits < this.maxUnits) {
      const { x, y } = this;
      if (map.getUnit({ x, y }) === null) {
        const spawnedUnit = await UnitFactory.createUnit({
          name: this.unitClass.name,
          unitClass: this.unitClass,
          coordinates: { x, y },
          level: 1,
          controller: HUMAN_DETERMINISTIC,
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

export default Spawner;
export { SpawnerState };
