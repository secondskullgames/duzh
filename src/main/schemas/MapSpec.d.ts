import MapType from './MapType';

type MapSpec = Readonly<{
  id: string;
  type: MapType;
}>;

export default MapSpec;
