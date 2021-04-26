import { initialize, restartGame } from './core/actions';
import { revealMap, killEnemies } from './core/debug';

initialize();

export {
  initialize,
  restartGame,
  killEnemies,
  revealMap,
};
