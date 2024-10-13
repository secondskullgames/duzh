import { levelUp as _levelUp } from '../actions/levelUp';
import Sounds from '../sounds/Sounds';
import { ItemFactory } from '../items/ItemFactory';
import { die } from '@main/actions/die';
import { MapController } from '@main/maps/MapController';
import { Faction } from '@main/units/Faction';
import { Game } from '@main/core/Game';
import { inject, injectable } from 'inversify';

@injectable()
export class DebugController {
  constructor(
    @inject(MapController)
    private readonly mapController: MapController,
    @inject(ItemFactory)
    private readonly itemFactory: ItemFactory
  ) {}

  revealMap = async (game: Game) => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    const map = playerUnit.getMap();
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.revealTile({ x, y });
      }
    }
  };

  killPlayer = async (game: Game) => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    await die(playerUnit, game);
  };

  levelUp = async (game: Game) => {
    const { state } = game;
    const playerUnit = state.getPlayerUnit();
    _levelUp(playerUnit, game);
  };

  awardEquipment = async (game: Game) => {
    const { itemFactory } = this;
    const { soundPlayer, state, ticker } = game;

    // eslint-disable-next-line no-alert
    const id = prompt('Enter a valid equipment_id')!;
    const item = await itemFactory.createInventoryEquipment(id);
    const playerUnit = state.getPlayerUnit();
    playerUnit.getInventory().add(item);
    ticker.log(`Picked up a ${item.name}.`, { turn: state.getTurn() });
    soundPlayer.playSound(Sounds.PICK_UP_ITEM);
  };

  killEnemies = async (game: Game) => {
    const playerUnit = game.state.getPlayerUnit();
    const map = playerUnit.getMap();
    for (const unit of map.getAllUnits()) {
      if (unit.getFaction() === Faction.ENEMY) {
        await die(unit, game);
      }
    }
  };

  attachToWindow = (game: Game) => {
    const { mapController } = this;
    const rootElelement = document.getElementById('debug');
    const items = [
      {
        label: 'Reveal Map',
        onClick: () => this.revealMap(game)
      },
      {
        label: 'Kill Enemies',
        onClick: () => this.killEnemies(game)
      },
      {
        label: 'Kill Player',
        onClick: () => this.killPlayer(game)
      },
      {
        label: 'Level Up',
        onClick: () => this.levelUp(game)
      },
      {
        label: 'Next Level',
        onClick: () => mapController.loadNextMap(game)
      },
      {
        label: 'Award Equipment',
        onClick: () => this.awardEquipment(game)
      }
    ];
    if (rootElelement) {
      for (const item of items) {
        const button = document.createElement('button');
        button.addEventListener('click', item.onClick);
        button.innerHTML = item.label;
        rootElelement.appendChild(button);
      }
      rootElelement.style.display = 'block';
    }
  };
}
