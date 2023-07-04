import { GlobalContext } from '../../core/GlobalContext';

export const killEnemies = async ({ state }: GlobalContext) => {
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
};