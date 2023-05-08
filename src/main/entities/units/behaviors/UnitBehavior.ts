import Unit from '../Unit';
import GameState from '../../../core/GameState';
import GameRenderer from '../../../graphics/renderers/GameRenderer';
import ImageFactory from '../../../graphics/images/ImageFactory';

export type UnitBehaviorProps = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export default interface UnitBehavior {
  execute: (unit: Unit, { state }: UnitBehaviorProps) => Promise<void>
};