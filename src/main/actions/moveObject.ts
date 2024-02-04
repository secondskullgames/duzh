import Coordinates from '../geometry/Coordinates';
import GameObject from '../entities/objects/GameObject';
import MapInstance from '../maps/MapInstance';

type Context = Readonly<{
  map: MapInstance;
}>;

/**
 * TODO - should this be merged with {@link moveUnit}?
 */
export const moveObject = async (
  object: GameObject,
  coordinates: Coordinates,
  { map }: Context
) => {
  map.removeObject(object);
  object.setCoordinates(coordinates);
  map.addObject(object);
};
