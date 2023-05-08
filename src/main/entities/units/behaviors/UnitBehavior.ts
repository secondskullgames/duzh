import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import AnimationFactory from '../../../graphics/animations/AnimationFactory';

export type UnitBehaviorProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  animationFactory: AnimationFactory
}>;

export default interface UnitBehavior {
  execute: (unit: Unit, { state }: UnitBehaviorProps) => Promise<void>
};