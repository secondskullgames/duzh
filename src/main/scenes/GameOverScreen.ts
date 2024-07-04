import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import GameOverScreenInputHandler from '@main/input/screens/GameOverScreenInputHandler';
import { GameOverScreenRenderer } from '@main/graphics/renderers/GameOverScreenRenderer';
import { inject, injectable } from 'inversify';

@injectable()
export class GameOverScene implements Scene {
  readonly name = SceneName.GAME_OVER;

  constructor(
    @inject(GameOverScreenInputHandler)
    readonly inputHandler: GameOverScreenInputHandler,
    @inject(GameOverScreenRenderer)
    readonly renderer: GameOverScreenRenderer
  ) {}
}
