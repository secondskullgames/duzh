import MapSpec from '../schemas/MapSpec';
import MapInstance from '../maps/MapInstance';
import MapFactory from '../maps/MapFactory';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';
import ImageFactory from '../graphics/images/ImageFactory';

type Props = Readonly<{
  mapSpecs: MapSpec[]
}>;

export type GetMapContext = Readonly<{
  state: GameState,
  mapFactory: MapFactory,
  imageFactory: ImageFactory
}>;

export default class Dungeon {
  private readonly mapSpecs: MapSpec[];
  private readonly maps: Record<string, MapInstance>;
  
  constructor({ mapSpecs }: Props) {
    this.mapSpecs = mapSpecs;
    this.maps = {};
  }
  
  hasMap = (id: string): boolean =>{
    return this.mapSpecs.some(mapSpec => mapSpec.id === id);
  };

  getMap = async (
    id: string,
    { state, mapFactory, imageFactory }: GetMapContext
  ): Promise<MapInstance> => {
    if (this.maps[id]) {
      return this.maps[id];
    }
    const mapSpec = checkNotNull(this.mapSpecs.find(mapSpec => mapSpec.id === id));
    return mapFactory.loadMap(mapSpec, { state, imageFactory });
  };
  
  addMap = (map: MapSpec) => {
    this.mapSpecs.push(map);
  };
  
  clear = () => {
    this.mapSpecs.splice(0, this.mapSpecs.length);
    for (const key of Object.keys(this.maps)) {
      delete this.maps[key];
    }
  };
}