import { GameState } from '../core/GameState';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';
import { Feature } from '../utils/features';
import { Session } from '../core/Session';

const _loadMapSpecs = async (): Promise<MapSpec[]> =>
  (
    await import(
      /* webpackChunkName: "models" */
      `../../../data/maps.json`
    )
  ).default as MapSpec[];

const _initGodMode = async (session: Session, state: GameState) => {
  const playerUnit = session.getPlayerUnit();
  const ticker = session.getTicker();
  ticker.log('You are a god! Use your power wisely!', {
    turn: session.getTurn()
  });
  for (const equipmentId of ['god_sword', 'god_armor']) {
    const equipment = await state.getItemFactory().createEquipment(equipmentId);
    playerUnit.getEquipment().add(equipment);
    equipment.attach(playerUnit);
    ticker.log(`Equipped ${equipment.getName()}.`, { turn: session.getTurn() });
  }
};

/**
 * TODO - this method can't decide if it's state-based or session-based
 */
export const addInitialState = async (state: GameState, session: Session) => {
  const mapSpecs = await _loadMapSpecs();
  const maps: MapSupplier[] = mapSpecs.map((spec, i) => {
    return async () => {
      const map = await state.getMapFactory().loadMap(spec, state);
      // TODO really sketchy place to put this logic
      if (i === 0) {
        const playerUnit = await state
          .getUnitFactory()
          .createPlayerUnit(map.getStartingCoordinates(), map);
        map.addUnit(playerUnit);
        if (Feature.isEnabled(Feature.GOD_MODE)) {
          await _initGodMode(session, state);
        }
        session.setPlayerUnit(playerUnit);
      }
      return map;
    };
  });
  state.addMaps(maps);
};
