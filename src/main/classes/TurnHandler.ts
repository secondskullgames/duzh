import Unit from './Unit';
import { chainPromises } from '../utils/PromiseUtils';

type UpdateProc = () => Promise<any>;

function playTurn(playerUnitOrder: ((unit: Unit) => Promise<void>) | null, doUpdate: boolean): Promise<void> {
  const { renderer } = jwb;
  const { playerUnit } = jwb.state;
  if (doUpdate) {
    playerUnit.queuedOrder = !!playerUnitOrder ? (() => playerUnitOrder(playerUnit)) : null;
    return update();
  } else {
    return renderer.render();
  }
}

function update(): Promise<void> {
  const { state } = jwb;
  const { playerUnit } = state;
  const map = state.getMap();

  // make sure the player unit's update happens first
  const unitPromises: UpdateProc[] = [];
  unitPromises.push(() => playerUnit.update());
  map.units.forEach(u => {
    if (u !== playerUnit) {
      unitPromises.push(() => u.update());
    }
  });

  return chainPromises(unitPromises)
    .then(() => jwb.renderer.render())
    .then(() => {
      state.turn++;
      state.messages = [];
    });
}

export default {
  playTurn
};