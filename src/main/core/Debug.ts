import { levelUp as _levelUp } from '../actions/levelUp';
import Sounds from '../sounds/Sounds';
import MapInstance from '../maps/MapInstance';
import { die } from '@main/actions/die';
import { Faction } from '@main/units/Faction';
import { Globals } from '@main/core/globals';

export class Debug {
  private _isMapRevealed: boolean;

  constructor() {
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const { session } = Globals;
    const playerUnit = session.getPlayerUnit();
    await die(playerUnit);
  };

  levelUp = async () => {
    const { session } = Globals;
    const playerUnit = session.getPlayerUnit();
    _levelUp(playerUnit, session);
  };

  awardEquipment = async () => {
    const { session, itemFactory, soundPlayer } = Globals;

    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = session.getPlayerUnit();
    playerUnit.getInventory().add(item);
    session.getTicker().log(`Picked up a ${item.name}.`, { turn: session.getTurn() });
    soundPlayer.playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    const { session, mapController } = Globals;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb.debug = {
      ...this,
      killEnemies: () => this.killEnemies(session.getMap()),
      nextLevel: async () => {
        await mapController.loadNextMap();
      }
    };
  };

  private killEnemies = async (map: MapInstance) => {
    for (const unit of map.getAllUnits()) {
      if (unit.getFaction() === Faction.ENEMY) {
        await die(unit);
      }
    }
  };
}
