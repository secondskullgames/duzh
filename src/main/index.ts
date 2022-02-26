import { initialize } from './core/actions';
import { initDebug } from './core/debug';
import { render as renderEditor } from './editor/App';

(async () => {
  await initialize();
  initDebug();
  renderEditor();
})();
