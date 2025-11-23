import { MapSpec } from '@duzh/models';

export interface GameConfig {
  readonly mapSpecs: MapSpec[];
  readonly screenWidth: number;
  readonly screenHeight: number;
}
