import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import VictoryScreenInputHandler from '@main/input/screens/VictoryScreenInputHandler';
import { VictoryScreenRenderer } from '@main/graphics/renderers/VictoryScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class VictoryScene implements Scene {
  readonly name = SceneName.VICTORY;

  constructor(
    @inject(VictoryScreenInputHandler)
    readonly inputHandler: VictoryScreenInputHandler,
    @inject(VictoryScreenRenderer)
    readonly renderer: VictoryScreenRenderer
  ) {}
}
