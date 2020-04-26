import { restartGame } from './actions';
import { revealMap, killEnemies } from './debug';

function init() {
  // @ts-ignore
  window.jwb = window.jwb || {};
  restartGame();
}

export {
  init,
  killEnemies,
  revealMap,
};