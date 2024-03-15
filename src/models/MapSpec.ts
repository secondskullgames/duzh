import { MapType } from './MapType';

export type MapSpec = Readonly<{
  id: string;
  type: MapType;
}>;
