import { initialize } from './core/actions';
import { initDebug } from './core/debug';
// import { render as renderEditor } from './editor/Editor';

(async () => {
  await initialize();
  initDebug();
  // renderEditor();
})();
