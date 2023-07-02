import GameState from '../../core/GameState';

type Context = Readonly<{
  state: GameState
}>;

export const killEnemies = async ({ state }: Context) => {
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
};