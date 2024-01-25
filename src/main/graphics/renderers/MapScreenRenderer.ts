import { RenderContext, Renderer } from './Renderer';
import Coordinates from '../../geometry/Coordinates';
import Color from '../Color';
import Colors from '../Colors';
import { Graphics } from '../Graphics';
import { getItem } from '../../maps/MapUtils';
import { checkNotNull } from '../../utils/preconditions';

const backgroundColor = Color.fromHex('#404040');

type Props = Readonly<{
  graphics: Graphics;
}>;

export default class MapScreenRenderer implements Renderer {
  private readonly graphics: Graphics;

  constructor({ graphics }: Props) {
    this.graphics = graphics;
  }

  /**
   * @override {@link Renderer#render}
   */
  render = async (context: RenderContext) => {
    const { graphics } = this;
    const { session } = context;
    const map = checkNotNull(session.getMap());

    graphics.fill(backgroundColor);
    const cellDimension = Math.floor(
      Math.min(graphics.getWidth() / map.width, graphics.getHeight() / map.height)
    );

    const left = (graphics.getWidth() - map.width * cellDimension) / 2;
    const top = (graphics.getHeight() - map.height * cellDimension) / 2;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const color = this._getColor({ x, y }, context);
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

  private _getColor = (coordinates: Coordinates, context: RenderContext): Color => {
    const { session } = context;
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
