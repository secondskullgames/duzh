import Unit from './Unit';
import { chainPromises } from '../utils/PromiseUtils';

type UpdateProc = () => Promise<any>;

function playTurn(playerUnitOrder: ((unit: Unit) => Promise<void>) | null, doUpdate: boolean): Promise<void> {
  const { renderer } = jwb;
  const { playerUnit } = jwb.state;
  if (doUpdate) {
    playerUnit.queuedOrder = playerUnitOrder;
    return update();
  } else {
    return renderer.render();
  }
}

function update(): Promise<void> {
  const { state } = jwb;
  const { playerUnit, map } = jwb.state;

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