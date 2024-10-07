import { levelUp as _levelUp } from '../actions/levelUp';
import Sounds from '../sounds/Sounds';
import { ItemFactory } from '../items/ItemFactory';
import MapInstance from '../maps/MapInstance';
import { die } from '@main/actions/die';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/units/Faction';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';

@injectable()
export class DebugController {
  private _isMapRevealed: boolean;

  constructor(
    @inject(Game)
    private readonly game: Game,
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
    const { session } = this.game;
    const playerUnit = session.getPlayerUnit();
    await die(playerUnit, this.game);
  };

  levelUp = async () => {
    const { session } = this.game;
    const playerUnit = session.getPlayerUnit();
    _levelUp(playerUnit, this.game);
  };

  awardEquipment = async () => {
    const { itemFactory } = this;
    const { soundPlayer, session, ticker } = this.game;

    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = session.getPlayerUnit();
    playerUnit.getInventory().add(item);
    ticker.log(`Picked up a ${item.name}.`, { turn: session.getTurn() });
    soundPlayer.playSound(Sounds.PICK_UP_ITEM);
  };

  attachToWindow = () => {
    const { mapController } = this;
    const { session } = this.game;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb = window.jwb ?? {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.jwb.debug = {
      ...this,
      killEnemies: () => this.killEnemies(session.getPlayerUnit().getMap()),
      nextLevel: async () => {
        await mapController.loadNextMap();
      }
    };
  };

  private killEnemies = async (map: MapInstance) => {
    for (const unit of map.getAllUnits()) {
      if (unit.getFaction() === Faction.ENEMY) {
        await die(unit, this.game);
      }
    }
  };
}