import { Feature } from '@main/utils/features';
import { spawnFogUnits } from '@main/actions/spawnFogUnits';
import { Game } from '@main/core/Game';

export const doMapEvents = async (game: Game) => {
  if (Feature.isEnabled(Feature.FOG_SHADES)) {
    await spawnFogUnits(game);
  }
};
