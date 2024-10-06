import { Feature } from '@main/utils/features';
import { spawnFogUnits } from '@main/actions/spawnFogUnits';

export const doMapEvents = async () => {
  if (Feature.isEnabled(Feature.FOG_SHADES)) {
    await spawnFogUnits();
  }
};
