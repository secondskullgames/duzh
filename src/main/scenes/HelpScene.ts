import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import HelpScreenInputHandler from '@main/input/screens/HelpScreenInputHandler';
import { HelpScreenRenderer } from '@main/graphics/renderers/HelpScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class HelpScene implements Scene {
  readonly name = SceneName.HELP;

  constructor(
    @inject(HelpScreenInputHandler)
    readonly inputHandler: HelpScreenInputHandler,
    @inject(HelpScreenRenderer)
    readonly renderer: HelpScreenRenderer
  ) {}
}
