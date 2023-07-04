import UnitFactory from '../entities/units/UnitFactory';
import MapSpec from '../schemas/MapSpec';
import { MapSupplier } from '../maps/MapSupplier';
import MapFactory from '../maps/MapFactory';
import { GlobalContext } from '../core/GlobalContext';

export const addInitialState = async (context: GlobalContext) => {
  const { state } = context;

  const playerUnit = await UnitFactory.createPlayerUnit(context);
  state.setPlayerUnit(playerUnit);
  const mapSpecs = (await import(
    /* webpackChunkName: "models" */
    `../../../data/maps.json`
    )).default as MapSpec[];
  const maps: MapSupplier[] = mapSpecs.map(spec => {
    return () => MapFactory.loadMap(spec, context);
  });
  state.addMaps(maps);
};