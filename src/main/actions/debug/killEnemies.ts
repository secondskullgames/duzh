import Game from '../../core/Game';
import MapInstance from '../../maps/MapInstance';

type Context = Readonly<{
  game: Game,
  map: MapInstance
}>;

export const killEnemies = async ({ game, map }: Context) => {
  const playerUnit = game.getPlayerUnit();
  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
};