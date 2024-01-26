import { Session } from '../../core/Session';
import MapInstance from '../../maps/MapInstance';

export const killEnemies = async (map: MapInstance, session: Session) => {
  const playerUnit = session.getPlayerUnit();

  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
};
