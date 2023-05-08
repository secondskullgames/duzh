import Unit from '../Unit';
import GameState from '../../../core/GameState';

export type UnitBehaviorProps = Readonly<{
  state: GameState
}>;

export default interface UnitBehavior {
  execute: (unit: Unit, { state }: UnitBehaviorProps) => Promise<void>
};