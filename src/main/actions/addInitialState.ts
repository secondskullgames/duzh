import GameState from '../core/GameState';
import UnitFactory from '../entities/units/UnitFactory';
import ImageFactory from '../graphics/images/ImageFactory';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';
import MapFactory from '../maps/MapFactory';
import { Feature } from '../utils/features';
import ItemFactory from '../items/ItemFactory';
import Ticker from '../core/Ticker';
import { Session } from '../core/Session';

type Context = Readonly<{
  state: GameState;
  imageFactory: ImageFactory;
  mapFactory: MapFactory;
  session: Session;
}>;

export const addInitialState = async ({
  state,
  imageFactory,
  mapFactory,
  session
}: Context) => {
  const ticker = session.getTicker();
  const playerUnit = await UnitFactory.createPlayerUnit({
    imageFactory
  });
  if (Feature.isEnabled(Feature.GOD_MODE)) {
    ticker.log('You are a god! Use your power wisely!', { turn: state.getTurn() });
    for (const equipmentId of ['god_sword', 'god_armor']) {
      const equipment = await ItemFactory.createEquipment(equipmentId, { imageFactory });
      playerUnit.getEquipment().add(equipment);
      equipment.attach(playerUnit);
      ticker.log(`Equipped ${equipment.getName()}.`, { turn: state.getTurn() });
    }
  }
  state.setPlayerUnit(playerUnit);
  const mapSpecs = (
    await import(
      /* webpackChunkName: "models" */
      `../../../data/maps.json`
    )
  ).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(spec => {
    return () =>
      mapFactory.loadMap(spec, {
        state,
        imageFactory
      });
  });
  state.addMaps(maps);
};
