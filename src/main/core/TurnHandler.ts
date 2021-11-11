import Unit from '../units/Unit';
import PlayerUnitController from '../units/controllers/PlayerUnitController';
import { render } from './actions';

const playTurn = async (playerUnitOrder: ((unit: Unit) => Promise<void>) | null) => {
  const { playerUnit } = jwb.state;
  const playerController = <PlayerUnitController>(playerUnit.controller);
  playerController.queuedOrder = !!playerUnitOrder ? (() => playerUnitOrder(playerUnit)) : null;
  return _update();
};

const _update = async () => {
  const { state } = jwb;
  const { playerUnit } = state;
  const map = state.getMap();

  // make sure the player unit's update happens first
  await playerUnit.update();
  // other units are processed in unspecified order
  for (const unit of map.units) {
    if (unit !== playerUnit) {
      await unit.update();
    }
  }

  await render();
  state.turn++;
  state.messages = [];
};

export default {
  playTurn
};
