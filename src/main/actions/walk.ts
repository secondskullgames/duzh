import Unit from '../entities/units/Unit';
import Direction from '../geometry/Direction';
import Coordinates from '../geometry/Coordinates';
import { moveUnit } from './moveUnit';
import GameState from '../core/GameState';
import GameRenderer from '../graphics/renderers/GameRenderer';
import ImageFactory from '../graphics/images/ImageFactory';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer,
  imageFactory: ImageFactory
}>;

export const walk = async (
  unit: Unit,
  direction: Direction,
  { state, renderer, imageFactory }: Props
) => {
  const map = state.getMap();
  const coordinates = Coordinates.plus(unit.getCoordinates(), direction);

  if (!map.contains(coordinates) || map.isBlocked(coordinates)) {
    // do nothing
  } else {
    await moveUnit(unit, coordinates, { state, renderer, imageFactory });
  }
};