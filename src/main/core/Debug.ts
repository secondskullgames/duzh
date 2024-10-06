import { levelUp as _levelUp } from '../actions/levelUp';
import Sounds from '../sounds/Sounds';
import { ItemFactory } from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';
import { die } from '@main/actions/die';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/units/Faction';
import { Engine } from '@main/core/Engine';
import { inject, injectable } from 'inversify';

@injectable()
export class Debug {
  private _isMapRevealed: boolean;

  constructor(
    @inject(Engine)
    private readonly engine: Engine,
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
    const { engine } = this;
    const session = engine.getSession();
    const state = engine.getState();
    const playerUnit = session.getPlayerUnit();
    await die(playerUnit, state, session);
  };

  levelUp = async () => {
    const { engine } = this;
    const session = engine.getSession();
    const playerUnit = session.getPlayerUnit();
    _levelUp(playerUnit, session);
  };

  awardEquipment = async () => {
    const { engine, itemFactory } = this;
    const session = engine.getSession();
    const state = engine.getState();

    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = session.getPlayerUnit();
    playerUnit.getInventory().add(item);
    session.getTicker().log(`Picked up a ${item.name}.`, { turn: session.getTurn() });
    state.getSoundPlayer().playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    const { engine, mapController } = this;
    const session = engine.getSession();
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
    const { engine } = this;
    const session = engine.getSession();
    const state = engine.getState();
    for (const unit of map.getAllUnits()) {
      if (unit.getFaction() === Faction.ENEMY) {
        await die(unit, state, session);
      }
    }
  };
}
