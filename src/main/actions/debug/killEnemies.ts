import GameState from '../../core/GameState';
import GameRenderer from '../../graphics/renderers/GameRenderer';

type Props = Readonly<{
  state: GameState,
  renderer: GameRenderer
}>;

export const killEnemies = async ({ state, renderer }: Props) => {
  const map = state.getMap();
  const playerUnit = state.getPlayerUnit();
  for (const unit of map.getAllUnits()) {
    if (unit !== playerUnit) {
      map.removeUnit(unit);
    }
  }
  await renderer.render();
};