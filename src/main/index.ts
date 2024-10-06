import 'reflect-metadata';
import { showTitleScreen } from './actions/showTitleScreen';
import { Feature } from './utils/features';
import { createCanvas, enterFullScreen, isMobileDevice } from '@lib/utils/dom';
import { checkNotNull } from '@lib/utils/preconditions';
import { Graphics } from '@lib/graphics/Graphics';
import { TitleScene } from '@main/scenes/TitleScene';
import { GameScene } from '@main/scenes/GameScene';
import { InventoryScene } from '@main/scenes/InventoryScene';
import { CharacterScene } from '@main/scenes/CharacterScene';
import { VictoryScene } from '@main/scenes/VictoryScene';
import { HelpScene } from '@main/scenes/HelpScene';
import { GameOverScene } from '@main/scenes/GameOverScene';
import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { MapScene } from '@main/scenes/MapScene';
import { Globals } from '@main/core/globals';
import { createInputHandler } from '@main/input/createInputHandler';

type Props = Readonly<{
  rootElement: HTMLElement;
}>;

const init = async ({ rootElement }: Props) => {
  const { gameConfig } = Globals;
  const canvas = createCanvas({
    width: gameConfig.screenWidth,
    height: gameConfig.screenHeight
  });
  rootElement.appendChild(canvas);
  canvas.tabIndex = 0;
  canvas.focus();
  const canvasGraphics = Graphics.forCanvas(canvas);

  if (isMobileDevice()) {
    await enterFullScreen();
  }
  if (Feature.isEnabled(Feature.DEBUG_BUTTONS)) {
    const { debug } = Globals;
    debug.attachToWindow();
    const debugElement = document.getElementById('debug');
    if (debugElement) {
      debugElement.style.display = 'block';
    }
  }

  const { session } = Globals;
  const scenes: Record<SceneName, Scene> = {
    [SceneName.CHARACTER]: new CharacterScene(),
    [SceneName.GAME]: new GameScene(),
    [SceneName.GAME_OVER]: new GameOverScene(),
    [SceneName.HELP]: new HelpScene(),
    [SceneName.INVENTORY]: new InventoryScene(),
    [SceneName.MAP]: new MapScene(),
    [SceneName.TITLE]: new TitleScene(),
    [SceneName.VICTORY]: new VictoryScene()
  };
  for (const scene of Object.values(scenes)) {
    session.addScene(scene);
  }

  const inputHandler = createInputHandler();
  inputHandler.addEventListener(canvas);

  await showTitleScreen();
  setInterval(async () => {
    const currentScene = session.getCurrentScene();
    if (currentScene) {
      await currentScene.render(canvasGraphics);
    }
  }, 20);
};

const main = async () => {
  const rootElement = checkNotNull(document.getElementById('container'));
  await init({ rootElement });
};

main().catch(e => {
  console.error(e);
  // eslint-disable-next-line no-alert
  alert(e);
});
