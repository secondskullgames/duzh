/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only nitended for debugging purposes.
 */

import { GameScreen } from '../types/types';

function revealMap() {
  jwb.DEBUG = true;
  jwb.renderer.render();
}

function killEnemies() {
  const map = jwb.state.getMap();
  map.units = map.units.filter(u => u === jwb.state.playerUnit);
  jwb.renderer.render();
}

function killPlayer() {
  const map = jwb.state.getMap();
  const playerUnit = map.units.filter(u => u === jwb.state.playerUnit)[0];
  playerUnit.takeDamage(playerUnit.life);
  jwb.renderer.render();
}

function renderMinimap() {
  jwb.state.screen = GameScreen.MINIMAP;
}

type DebugShape = {
  revealMap: () => void,
  killEnemies: () => void,
  killPlayer: () => void
};

export function initDebug() {
  // @ts-ignore
  window.jwb = window.jwb || {};
  jwb.debug = jwb.debug || {
    revealMap,
    killEnemies,
    killPlayer
  };
}

export default { initDebug };

export type { DebugShape };