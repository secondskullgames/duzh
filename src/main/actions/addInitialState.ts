import { GameState } from '../core/GameState';
import UnitFactory from '../entities/units/UnitFactory';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';
import { Feature } from '../utils/features';
import { Session } from '../core/Session';

/**
 * TODO - this method can't decide if it's state-based or session-based
 */
export const addInitialState = async (state: GameState, session: Session) => {
  const ticker = session.getTicker();
  const playerUnit = await UnitFactory.createPlayerUnit(state);
  if (Feature.isEnabled(Feature.GOD_MODE)) {
    ticker.log('You are a god! Use your power wisely!', { turn: session.getTurn() });
    for (const equipmentId of ['god_sword', 'god_armor']) {
      const equipment = await state.getItemFactory().createEquipment(equipmentId);
      playerUnit.getEquipment().add(equipment);
      equipment.attach(playerUnit);
      ticker.log(`Equipped ${equipment.getName()}.`, { turn: session.getTurn() });
    }
  }
  session.setPlayerUnit(playerUnit);
  const mapSpecs = (
    await import(
      /* webpackChunkName: "models" */
      `../../../data/maps.json`
    )
  ).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(spec => {
    return () => state.getMapFactory().loadMap(spec, state, session);
  });
  state.addMaps(maps);
};
