import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';

export type UnitBehaviorProps = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export default interface UnitBehavior {
  execute: (unit: Unit, { state }: UnitBehaviorProps) => Promise<void>
};