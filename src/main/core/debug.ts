/*
 * This file defines additional functions that will be exported to the "global namespace" (window.jwb.*)
 * that are only intended for debugging purposes.
 */

import { subtract } from '../utils/arrays';
import { loadNextMap, render } from './actions';
import GameState from './GameState';

const toggleRevealMap = async () => {
  jwb.REVEAL_MAP = !jwb.REVEAL_MAP;
  await render();
};

const killEnemies = async () => {
  const state = GameState.getInstance();
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  subtract(map.units, map.units.filter(u => u !== playerUnit));
  await render();
};

const killPlayer = async () => {
  const playerUnit = GameState.getInstance().getPlayerUnit();
  await playerUnit.takeDamage(playerUnit.getMaxLife());
  await render();
};

const nextLevel = async () => {
  await loadNextMap();
  await render();
};

const levelUp = async () => {
  const playerUnit = GameState.getInstance().getPlayerUnit();
  playerUnit.levelUp();
  await render();
};

type DebugShape = Readonly<{
  toggleRevealMap: () => void,
  killEnemies: () => void,
  killPlayer: () => void,
  nextLevel: () => void,
  levelUp: () => void
}>;

export const initDebug = () => {
  // @ts-ignore
  window.jwb = window.jwb ?? {};
  jwb.debug = jwb.debug ?? {
    toggleRevealMap,
    killEnemies,
    killPlayer,
    nextLevel,
    levelUp
  };

  jwb.REVEAL_MAP = false;
};

export default { initDebug };

export type { DebugShape };
