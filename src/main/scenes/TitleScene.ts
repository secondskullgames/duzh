import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import TitleScreenInputHandler from '@main/input/screens/TitleScreenInputHandler';
import { TitleScreenRenderer } from '@main/graphics/renderers/TitleScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class TitleScene implements Scene {
  readonly name = SceneName.TITLE;

  constructor(
    @inject(TitleScreenInputHandler)
    readonly inputHandler: TitleScreenInputHandler,
    @inject(TitleScreenRenderer)
    readonly renderer: TitleScreenRenderer
  ) {}
}
