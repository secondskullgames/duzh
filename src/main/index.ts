import { initialize } from './core/actions';
import { initDebug } from './core/debug';

(async () => {
  await initialize();
  initDebug();
})();
