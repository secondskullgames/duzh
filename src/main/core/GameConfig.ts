import MapSpec from '@main/schemas/MapSpec';

export interface GameConfig {
  readonly mapSpecs: MapSpec[];
}

export const GameConfig = Symbol('GameConfig');
