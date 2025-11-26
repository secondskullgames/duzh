import { Coordinates } from '@duzh/geometry';

type Connection = Readonly<{
  connectedCoordinates: Coordinates[];
}>;

export default Connection;
