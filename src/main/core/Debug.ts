import { GameState } from './GameState';
import { Session } from './Session';
import { levelUp as _levelUp } from '../actions/levelUp';
import { die } from '../actions/die';
import { playSound } from '../sounds/playSound';
import Sounds from '../sounds/Sounds';
import ItemFactory from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';
import { Faction } from '../types/types';
import { MapController } from '../maps/MapController';
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
    _levelUp(playerUnit, this.session);
  };

  awardEquipment = async () => {
    const { session, itemFactory } = this;
    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = session.getPlayerUnit();
    playerUnit.getInventory().add(item);
    session
      .getTicker()
      .log(`Picked up a ${item.name}.`, { turn: this.session.getTurn() });
    playSound(Sounds.PICK_UP_ITEM);
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
