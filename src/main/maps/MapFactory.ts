import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
import { GeneratedMapFactory } from './generated/GeneratedMapFactory';
import { MapSpec } from '@models/MapSpec';
import { MapType } from '@models/MapType';
import { injectable } from 'inversify';

@injectable()
export default class MapFactory {
  constructor(
    private readonly predefinedMapFactory: PredefinedMapFactory,
    private readonly generatedMapFactory: GeneratedMapFactory
  ) {}

  loadMap = async (mapSpec: MapSpec): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case MapType.GENERATED: {
        return this.generatedMapFactory.loadMap(mapSpec.id);
      }
      case MapType.PREDEFINED: {
        return this.predefinedMapFactory.buildPredefinedMap(mapSpec.id);
      }
    }
  };
}
