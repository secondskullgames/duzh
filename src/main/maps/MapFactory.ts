import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
import { GeneratedMapFactory } from './generated/GeneratedMapFactory';
import { MapSpec } from '@models/MapSpec';
import { MapType } from '@models/MapType';

export default class MapFactory {
  private readonly predefinedMapFactory = new PredefinedMapFactory();
  private readonly generatedMapFactory = new GeneratedMapFactory();

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
