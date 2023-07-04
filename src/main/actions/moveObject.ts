import Coordinates from '../geometry/Coordinates';
import GameObject from '../entities/objects/GameObject';
import { GlobalContext } from '../core/GlobalContext';

/**
 * TODO - should this be merged with {@link moveUnit}?
 */
export const moveObject = async (
  object: GameObject,
  coordinates: Coordinates,
  { state }: GlobalContext
) => {
  const map = state.getMap();
  map.removeObject(object);

  object.setCoordinates(coordinates);
  map.addObject(object);
};