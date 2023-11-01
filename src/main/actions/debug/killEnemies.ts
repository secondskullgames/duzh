import GameState from '../../core/GameState';
import MapInstance from '../../maps/MapInstance';

type Context = Readonly<{
  state: GameState;
  map: MapInstance;
}>;

export const killEnemies = async ({ state, map }: Context) => {
  const playerUnit = state.getPlayerUnit();
  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
};
