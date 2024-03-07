import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
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
}
