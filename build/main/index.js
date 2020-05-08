import { initialize, restartGame } from './core/actions.js';
import { revealMap, killEnemies } from './core/debug.js';
// @ts-ignore
window.jwb = window.jwb || {};
// @ts-ignore
window.jwb.actions = {
    initialize: initialize,
    restartGame: restartGame,
    killEnemies: killEnemies,
    revealMap: revealMap
};
initialize();
//# sourceMappingURL=index.js.map