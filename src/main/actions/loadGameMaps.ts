import { GameState } from '../core/GameState';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';

export const loadGameMaps = async (
  mapSpecs: MapSpec[],
  state: GameState
): Promise<MapSupplier[]> => {
  const mapFactory = state.getMapFactory();
  const mapSuppliers: MapSupplier[] = [];
  for (const spec of mapSpecs) {
    mapSuppliers.push(async () => {
      return mapFactory.loadMap(spec, state);
    });
  }
  return mapSuppliers;
};
