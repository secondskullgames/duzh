import { Coordinates } from '@lib/geometry/Coordinates';

type Connection = Readonly<{
  connectedCoordinates: Coordinates[];
}>;

export default Connection;
