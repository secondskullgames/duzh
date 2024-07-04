import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import GameScreenInputHandler from '@main/input/screens/GameScreenInputHandler';
import GameScreenRenderer from '@main/graphics/renderers/GameScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class GameScene implements Scene {
  readonly name = SceneName.GAME;

  constructor(
    @inject(GameScreenInputHandler)
    readonly inputHandler: GameScreenInputHandler,
    @inject(GameScreenRenderer)
    readonly renderer: GameScreenRenderer
  ) {}
}
