import { MapSpec } from '@models/MapSpec';

export interface GameConfig {
  readonly mapSpecs: MapSpec[];
  readonly screenWidth: number;
  readonly screenHeight: number;
}
