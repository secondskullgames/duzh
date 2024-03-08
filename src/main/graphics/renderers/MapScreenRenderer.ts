import { Renderer } from './Renderer';
import Colors from '../Colors';
import Coordinates from '@lib/geometry/Coordinates';
import { Graphics } from '@lib/graphics/Graphics';
import { getItem } from '@main/maps/MapUtils';
import { checkNotNull } from '@lib/utils/preconditions';
import { Session } from '@main/core/Session';
import { Color } from '@lib/graphics/Color';
import { inject, injectable } from 'inversify';

const backgroundColor = Color.fromHex('#404040');

@injectable()
export default class MapScreenRenderer implements Renderer {
  constructor(
    @inject(Session)
    private readonly session: Session
  ) {}

  /**
   * @override {@link Renderer#render}
   */
  render = async (graphics: Graphics) => {
    const { session } = this;
    const map = checkNotNull(session.getMap());

    graphics.fill(backgroundColor);
    const cellDimension = Math.floor(
      Math.min(graphics.getWidth() / map.width, graphics.getHeight() / map.height)
    );

    const left = (graphics.getWidth() - map.width * cellDimension) / 2;
    const top = (graphics.getHeight() - map.height * cellDimension) / 2;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const color = this._getColor({ x, y }, session);
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

  private _getColor = (coordinates: Coordinates, session: Session): Color => {
    const map = checkNotNull(session.getMap());
    const playerUnit = session.getPlayerUnit();

    if (Coordinates.equals(playerUnit.getCoordinates(), coordinates)) {
      return Colors.GREEN;
    }

    if (map.isTileRevealed(coordinates)) {
      const tileType = map.getTile(coordinates).getTileType();
      switch (tileType) {
        case 'STAIRS_DOWN':
          return Colors.BLUE;
        case 'FLOOR':
        case 'FLOOR_HALL': {
          const unit = map.getUnit(coordinates);
          if (unit && unit?.getFaction() !== playerUnit.getFaction()) {
            return Colors.RED;
          } else if (getItem(map, coordinates)) {
            return Colors.YELLOW;
          }
          return Colors.LIGHT_GRAY;
        }
        case 'WALL':
        case 'WALL_HALL':
          return Colors.DARK_GRAY;
        case 'NONE':
        case 'WALL_TOP':
        default:
          return Colors.BLACK;
      }
    } else {
      return Colors.DARKER_GRAY;
    }
  };
}
