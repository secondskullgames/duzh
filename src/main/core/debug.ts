/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only intended for debugging purposes.
 */

import { GameScreen } from '../types/types';

const revealMap = async () => {
  jwb.DEBUG = true;
  return jwb.renderer.render();
};

const killEnemies = async () => {
  const map = jwb.state.getMap();
  map.units = map.units.filter(u => u === jwb.state.playerUnit);
  return jwb.renderer.render();
};

const killPlayer = async () => {
  const map = jwb.state.getMap();
  const playerUnit = map.units.filter(u => u === jwb.state.playerUnit)[0];
  await playerUnit.takeDamage(playerUnit.life);
  return jwb.renderer.render();
};

const renderMinimap = () => {
  jwb.state.screen = GameScreen.MINIMAP;
};

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
