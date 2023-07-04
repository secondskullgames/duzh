import { GlobalContext } from '../core/GlobalContext';

/**
 * Add any tiles the player can currently see to the map's revealed tiles list.
 */
export const updateRevealedTiles = ({ state }: GlobalContext) => {
  const playerUnit = state.getPlayerUnit();
  const map = state.getMap();

  const radius = 3;

  const { x: playerX, y: playerY } = playerUnit.getCoordinates();
  for (let y = playerY - radius; y <= playerY + radius; y++) {
    for (let x = playerX - radius; x <= playerX + radius; x++) {
      if (map.contains({ x, y }) && !map.isTileRevealed({ x, y })) {
        map.revealTile({ x, y });
      }
    }
  }
};