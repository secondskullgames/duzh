import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
import { MapSupplier } from './MapSupplier';
import { GeneratedMapFactory } from './generated/GeneratedMapFactory';
import MapSpec from '../schemas/MapSpec';
import { injectable } from 'inversify';

@injectable()
export default class MapFactory {
  constructor(
    private readonly predefinedMapFactory: PredefinedMapFactory,
    private readonly generatedMapFactory: GeneratedMapFactory
  ) {}

  loadMap = async (mapSpec: MapSpec): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case 'generated': {
        return this.generatedMapFactory.loadMap(mapSpec.id);
      }
      case 'predefined': {
        return this.predefinedMapFactory.buildPredefinedMap(mapSpec.id);
      }
    }
  };

  loadMapSuppliers = async (mapSpecs: MapSpec[]): Promise<MapSupplier[]> => {
    const mapSuppliers: MapSupplier[] = [];
    for (const spec of mapSpecs) {
      mapSuppliers.push(async () => {
        return this.loadMap(spec);
      });
    }
    return mapSuppliers;
  };
}
