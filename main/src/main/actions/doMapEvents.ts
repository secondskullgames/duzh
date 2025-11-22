import { Feature } from '@main/utils/features';
import { spawnFogUnits } from '@main/actions/spawnFogUnits';
import { Game } from '@main/core/Game';
import MapInstance from '@main/maps/MapInstance';

export const doMapEvents = async (map: MapInstance, game: Game) => {
  if (Feature.isEnabled(Feature.FOG_SHADES)) {
    await spawnFogUnits(map, game);
  }
};
