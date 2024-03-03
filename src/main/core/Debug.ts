import { GameState } from './GameState';
import { Session } from './Session';
import { levelUp as _levelUp } from '../actions/levelUp';
import Sounds from '../sounds/Sounds';
import ItemFactory from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';
import { die } from '@main/actions/die';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/entities/units/Faction';
import { EventType } from '@main/core/EventLog';
import { inject, injectable } from 'inversify';

@injectable()
export class Debug {
  private _isMapRevealed: boolean;

  constructor(
    @inject(GameState.SYMBOL)
    private readonly state: GameState,
    @inject(Session.SYMBOL)
    private readonly session: Session,
    @inject(MapController.SYMBOL)
    private readonly mapController: MapController,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory
  ) {
    this._isMapRevealed = false;
  }

  toggleRevealMap = async () => {
    this._isMapRevealed = !this._isMapRevealed;
  };

  isMapRevealed = () => this._isMapRevealed;

  killPlayer = async () => {
    const playerUnit = this.session.getPlayerUnit();
    await die(playerUnit, this.state, this.session);
  };

  levelUp = async () => {
    const playerUnit = this.session.getPlayerUnit();
    _levelUp(playerUnit, this.state, this.session);
  };

  awardEquipment = async () => {
    const { session, state, itemFactory } = this;
    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = session.getPlayerUnit();

    playerUnit.getInventory().add(item);
    const message = `Picked up a ${item.name}.`;
    state.getEventLog().log({
      type: EventType.ITEM_PICKED_UP,
      message,
      sessionId: session.id,
      turn: session.getTurn(),
      timestamp: new Date()
    });
    state.getSoundPlayer().playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    const { session, mapController } = this;
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
        map.removeUnit(unit);
      }
    }
  };
}
