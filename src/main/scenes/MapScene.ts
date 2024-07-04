import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import MapScreenInputHandler from '@main/input/screens/MapScreenInputHandler';
import { MapScreenRenderer } from '@main/graphics/renderers/MapScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class MapScene implements Scene {
  readonly name = SceneName.MAP;

  constructor(
    @inject(MapScreenInputHandler)
    readonly inputHandler: MapScreenInputHandler,
    @inject(MapScreenRenderer)
    readonly renderer: MapScreenRenderer
  ) {}
}
