import GameObject from '../objects/GameObject';
import MapInstance from '../maps/MapInstance';
import { Coordinates } from '@lib/geometry/Coordinates';

/** TODO - should define Object#getMap and use that instead of a parameter */
export const moveObject = async (
  object: GameObject,
  coordinates: Coordinates,
  map: MapInstance
) => {
  map.removeObject(object);
  object.setCoordinates(coordinates);
  map.addObject(object);
};
