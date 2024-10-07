import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
import { GeneratedMapFactory } from './generated/GeneratedMapFactory';
import { MapSpec } from '@models/MapSpec';
import { MapType } from '@models/MapType';
import { injectable } from 'inversify';
import { Game } from '@main/core/Game';

@injectable()
export default class MapFactory {
  constructor(
    private readonly predefinedMapFactory: PredefinedMapFactory,
    private readonly generatedMapFactory: GeneratedMapFactory
  ) {}

  loadMap = async (mapSpec: MapSpec, game: Game): Promise<MapInstance> => {
    switch (mapSpec.type) {
      case MapType.GENERATED: {
        return this.generatedMapFactory.loadMap(mapSpec.id, game);
      }
      case MapType.PREDEFINED: {
        return this.predefinedMapFactory.buildPredefinedMap(mapSpec.id);
      }
    }
  };
}
