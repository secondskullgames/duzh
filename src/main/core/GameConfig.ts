import MapSpec from '@main/schemas/MapSpec';

export interface GameConfig {
  readonly mapSpecs: MapSpec[];
  readonly screenWidth: number;
  readonly screenHeight: number;
}

export const GameConfig = Symbol('GameConfig');
