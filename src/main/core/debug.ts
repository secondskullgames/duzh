/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only intended for debugging purposes.
 */

import { render } from './actions';
import GameState from './GameState';

const revealMap = async () => {
  jwb.DEBUG = true;
  await render();
};

const killEnemies = async () => {
  const state = GameState.getInstance();
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  map.units = map.units.filter(u => u === playerUnit);
  await render();
};

const killPlayer = async () => {
  const playerUnit = GameState.getInstance().getPlayerUnit();
  await playerUnit.takeDamage(playerUnit.life);
  await render();
};

type DebugShape = {
  revealMap: () => void,
  killEnemies: () => void,
  killPlayer: () => void
};

export const initDebug = () => {
  // @ts-ignore
  window.jwb = window.jwb || {};
  jwb.debug = jwb.debug || {
    revealMap,
    killEnemies,
    killPlayer
  };
};

export default { initDebug };

export type { DebugShape };
