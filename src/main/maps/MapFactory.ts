import MapInstance from './MapInstance';
import { PredefinedMapFactory } from './predefined/PredefinedMapFactory';
import { MapSupplier } from './MapSupplier';
import { GeneratedMapFactory } from './generated/GeneratedMapFactory';
import GeneratedMapModel from '../schemas/GeneratedMapModel';
import PredefinedMapModel from '../schemas/PredefinedMapModel';
import levelOne from '../data/maps/levelOne';
import levelTwo from '../data/maps/levelTwo';
import levelThree from '../data/maps/levelThree';
import levelFour from '../data/maps/levelFour';
import levelFive from '../data/maps/levelFive';
import levelSix from '../data/maps/levelSix';
import levelSeven from '../data/maps/levelSeven';
import levelEight from '../data/maps/levelEight';
import { injectable } from 'inversify';

type LoadMapParams =
  | Readonly<{
      type: 'generated';
      model: GeneratedMapModel;
    }>
  | Readonly<{
      type: 'predefined';
      model: PredefinedMapModel;
    }>;

@injectable()
export default class MapFactory {
  constructor(
    private readonly predefinedMapFactory: PredefinedMapFactory,
    private readonly generatedMapFactory: GeneratedMapFactory
  ) {}

  loadMap = async ({ type, model }: LoadMapParams): Promise<MapInstance> => {
    switch (type) {
      case 'generated': {
        return this.generatedMapFactory.loadMap(model);
      }
      case 'predefined': {
        return this.predefinedMapFactory.loadMap(model);
      }
    }
  };

  loadMapSuppliers = async (): Promise<MapSupplier[]> => {
    return [
      () => this.loadMap({ type: 'generated', model: levelOne() }),
      () => this.loadMap({ type: 'generated', model: levelTwo() }),
      () => this.loadMap({ type: 'generated', model: levelThree() }),
      () => this.loadMap({ type: 'generated', model: levelFour() }),
      () => this.loadMap({ type: 'generated', model: levelFive() }),
      () => this.loadMap({ type: 'generated', model: levelSix() }),
      () => this.loadMap({ type: 'predefined', model: levelSeven() }),
      () => this.loadMap({ type: 'predefined', model: levelEight() })
    ];
  };
}
