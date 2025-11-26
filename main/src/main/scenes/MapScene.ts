import { Scene } from '@main/scenes/Scene';
import { SceneName } from '@main/scenes/SceneName';
import { ClickCommand, KeyCommand, ModifierKey } from '@lib/input/inputTypes';
import { toggleFullScreen } from '@lib/utils/dom';
import { Color, Graphics } from '@duzh/graphics';
import { Coordinates } from '@duzh/geometry';
import { TileType } from '@duzh/models';
import { isHostile } from '@main/units/UnitUtils';
import { getItem, getShrine } from '@main/maps/MapUtils';
import { Game } from '@main/core/Game';
import { InterfaceColors } from '@main/graphics/InterfaceColors';

const backgroundColor = Color.fromHex('#404040');

export class MapScene implements Scene {
  readonly name = SceneName.MAP;

  constructor(private readonly game: Game) {}

  handleKeyDown = async (command: KeyCommand) => {
    const { state } = this.game;
    const { key, modifiers } = command;

    switch (key) {
      case 'M':
        state.setScene(SceneName.GAME);
        break;
      case 'F1':
        state.setScene(SceneName.HELP);
        break;
      case 'ENTER':
        if (modifiers.includes(ModifierKey.ALT)) {
          await toggleFullScreen();
        }
        break;
      case 'ESCAPE':
        state.setScene(SceneName.GAME);
    }
  };

  handleKeyUp = async () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleClick = async (_: ClickCommand) => {
    const { state } = this.game;
    state.setScene(SceneName.GAME);
  };

  render = async (graphics: Graphics) => {
    const { state } = this.game;
    const playerUnit = state.getPlayerUnit();
    const map = playerUnit.getMap();

    graphics.fill(backgroundColor);
    const cellDimension = Math.floor(
      Math.min(graphics.getWidth() / map.width, graphics.getHeight() / map.height)
    );

    const left = (graphics.getWidth() - map.width * cellDimension) / 2;
    const top = (graphics.getHeight() - map.height * cellDimension) / 2;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const color = this._getColor({ x, y }, this.game);
        const rect = {
          left: x * cellDimension + left,
          top: y * cellDimension + top,
          width: cellDimension,
          height: cellDimension
        };
        graphics.fillRect(rect, color);
      }
    }
  };

  private _getColor = (coordinates: Coordinates, game: Game): Color => {
    const playerUnit = game.state.getPlayerUnit();
    const map = playerUnit.getMap();

    if (Coordinates.equals(playerUnit.getCoordinates(), coordinates)) {
      return InterfaceColors.GREEN;
    }

    if (map.isTileRevealed(coordinates)) {
      const tileType = map.getTile(coordinates).getTileType();
      switch (tileType) {
        case TileType.STAIRS_DOWN:
          return InterfaceColors.BLUE;
        case TileType.FLOOR:
        case TileType.FLOOR_HALL: {
          const unit = map.getUnit(coordinates);
          if (unit && isHostile(unit, playerUnit)) {
            return InterfaceColors.RED;
          } else if (getItem(map, coordinates)) {
            return InterfaceColors.YELLOW;
          } else if (getShrine(map, coordinates)) {
            return InterfaceColors.DARK_RED;
          }
          return InterfaceColors.LIGHT_GRAY;
        }
        case TileType.WALL:
        case TileType.WALL_HALL:
          return InterfaceColors.DARK_GRAY;
        case TileType.NONE:
        case TileType.WALL_TOP:
        default:
          return InterfaceColors.BLACK;
      }
    } else {
      return InterfaceColors.DARKER_GRAY;
    }
  };
}
