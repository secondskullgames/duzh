import Coordinates from '../geometry/Coordinates';
import GameState from '../core/GameState';
import GameObject from '../entities/objects/GameObject';

type Context = Readonly<{
  state: GameState
}>;

/**
 * TODO - should this be merged with {@link moveUnit}?
 */
export const moveObject = async (
  object: GameObject,
  coordinates: Coordinates,
  { state }: Context
) => {
  const map = state.getMap();
  map.removeObject(object);

  object.setCoordinates(coordinates);
  map.addObject(object);
};