import { Feature } from '@main/utils/features';
import { spawnFogUnits } from '@main/actions/spawnFogUnits';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';
import MapInstance from '@main/maps/MapInstance';

export const doMapEvents = async (
  map: MapInstance,
  state: GameState,
  session: Session
) => {
  if (Feature.isEnabled(Feature.FOG_SHADES)) {
    await spawnFogUnits(map, state, session);
  }
};
