import Unit from '../units/Unit';
import { chainPromises } from '../utils/PromiseUtils';
import PlayerUnitController from '../units/controllers/PlayerUnitController';

type UpdateProc = () => Promise<any>;

function playTurn(playerUnitOrder: ((unit: Unit) => Promise<void>) | null): Promise<void> {
  const { playerUnit } = jwb.state;
  const playerController = <PlayerUnitController>(playerUnit.controller);
  playerController.queuedOrder = !!playerUnitOrder ? (() => playerUnitOrder(playerUnit)) : null;
  return _update();
}

function _update(): Promise<void> {
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