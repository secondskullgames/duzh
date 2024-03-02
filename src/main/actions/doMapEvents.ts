import { Feature } from '@main/utils/features';
import { spawnFogUnits } from '@main/actions/spawnFogUnits';
import { GameState } from '@main/core/GameState';
import { Session } from '@main/core/Session';

export const doMapEvents = async (state: GameState, session: Session) => {
  if (Feature.isEnabled(Feature.FOG_SHADES)) {
    await spawnFogUnits(state, session);
  }
};
