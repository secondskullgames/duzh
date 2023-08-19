import MapSpec from '../schemas/MapSpec';
import MapInstance from '../maps/MapInstance';
import MapFactory from '../maps/MapFactory';
import { checkNotNull } from '../utils/preconditions';
import GameState from './GameState';

type Props = Readonly<{
  mapSpecs: MapSpec[]
}>;

export type GetMapContext = Readonly<{
  state: GameState,
  mapFactory: MapFactory
}>;

export default class Dungeon {
  private readonly mapSpecs: MapSpec[];
  private readonly maps: Record<string, MapInstance>;
  
  constructor({ mapSpecs }: Props) {
    this.mapSpecs = mapSpecs;
    this.maps = {};
  }

  getMap = async (
    id: string,
    { state, mapFactory }: GetMapContext
  ): Promise<MapInstance> => {
    if (this.maps[id]) {
      return this.maps[id];
    }
    const mapSpec = checkNotNull(this.mapSpecs.find(mapSpec => mapSpec.id === id));
    return mapFactory.loadMap(mapSpec, { state });
  };
  
  getNextMapId = (id?: string | null): string | null => {
    const index = this.mapSpecs.findIndex(mapSpec => mapSpec.id === id);
    return this.mapSpecs[index + 1]?.id ?? null;
  };
}