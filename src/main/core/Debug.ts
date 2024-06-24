import { GameState } from './GameState';
import { Session } from './Session';
import Sounds from '../sounds/Sounds';
import ItemFactory from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/units/Faction';
import { UnitApi } from '@main/units/UnitApi';
import { inject, injectable } from 'inversify';

@injectable()
export class Debug {
  private _isMapRevealed: boolean;

  constructor(
    @inject(GameState)
    private readonly state: GameState,
    @inject(Session)
    private readonly session: Session,
    @inject(MapController)
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
    await UnitApi.die(playerUnit, this.state, this.session);
  };

  levelUp = async () => {
    const playerUnit = this.session.getPlayerUnit();
    await UnitApi.levelUp(playerUnit, this.session);
  };

  awardEquipment = async () => {
    const { session, state, itemFactory } = this;
    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = session.getPlayerUnit();
    playerUnit.getInventory().add(item);
    session
      .getTicker()
      .log(`Picked up a ${item.name}.`, { turn: this.session.getTurn() });
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
