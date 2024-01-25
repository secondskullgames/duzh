import MapInstance from '../../maps/MapInstance';
import { Session } from '../../core/Session';

type Context = Readonly<{
  session: Session;
  map: MapInstance;
}>;

export const killEnemies = async ({ session, map }: Context) => {
  const playerUnit = session.getPlayerUnit();
  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
};
