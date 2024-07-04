import { SceneName } from '@main/scenes/SceneName';
import { Renderer } from '@main/graphics/renderers/Renderer';
import { SceneInputHandler } from '@main/input/screens/SceneInputHandler';

export interface Scene {
  readonly name: SceneName;
  readonly renderer: Renderer;
  readonly inputHandler: SceneInputHandler;
}
