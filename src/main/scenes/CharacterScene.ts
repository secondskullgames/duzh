import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import CharacterScreenInputHandler from '@main/input/screens/CharacterScreenInputHandler';
import { CharacterScreenRenderer } from '@main/graphics/renderers/CharacterScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class CharacterScene implements Scene {
  readonly name = SceneName.CHARACTER;

  constructor(
    @inject(CharacterScreenInputHandler)
    readonly inputHandler: CharacterScreenInputHandler,
    @inject(CharacterScreenRenderer)
    readonly renderer: CharacterScreenRenderer
  ) {}
}
