import RoomRegion from './RoomRegion';
import SplitDirection from './SplitDirection';
import Rect from '../../../geometry/Rect';
import { randInt } from '../../../utils/random';

const ROOM_PADDING = [2, 3, 1, 1]; // left, top, right, bottom

type Props = Readonly<{
  minRoomDimension: number;
  maxRoomDimension: number;
}>;

export default class RegionSplitter {
  private readonly minRoomDimension: number;
  private readonly maxRoomDimension: number;

  constructor({ minRoomDimension, maxRoomDimension }: Props) {
    this.minRoomDimension = minRoomDimension;
    this.maxRoomDimension = maxRoomDimension;
  }

  /**
   * Generate a rectangular area of tiles with the specified dimensions, consisting of any number of rooms connected
   * by corridors.  To do so, split the area into two sub-regions and call this method recursively.  If this area is
   * not large enough to form two sub-regions, just return a single region.
   */
  generateRegions = (
    left: number,
    top: number,
    width: number,
    height: number
  ): RoomRegion[] => {
    const splitDirection = this._getSplitDirection(width, height);
    switch (splitDirection) {
      case 'HORIZONTAL': {
        const splitX = this._getSplitPoint(left, width, splitDirection);
        const leftWidth = splitX - left;
        const leftRegions = this.generateRegions(left, top, leftWidth, height);
        const rightWidth = width - leftWidth;
        const rightRegions = this.generateRegions(splitX, top, rightWidth, height);
        return [...leftRegions, ...rightRegions];
      }
      case 'VERTICAL': {
        const splitY = this._getSplitPoint(top, height, splitDirection);
        const topHeight = splitY - top;
        const bottomHeight = height - topHeight;
        const topRegions = this.generateRegions(left, top, width, topHeight);
        const bottomRegions = this.generateRegions(left, splitY, width, bottomHeight);
        return [...topRegions, ...bottomRegions];
      }
      default: {
        // base case: generate single region
        const rect: Rect = {
          left,
          top,
          width,
          height
        };

        const padding = 1;
        const leftPadding = 2;
        const topPadding = 2;

        const roomRect: Rect = {
          left: left + leftPadding,
          top: top + topPadding,
          width: width - padding - leftPadding,
          height: height - padding - topPadding
        };

        return [{ rect, roomRect }];
      }
    }
  };

  _getSplitDirection = (width: number, height: number): SplitDirection | null => {
    // First, make sure the area is large enough to support two regions; if not, we're done
    const minWidth = this.minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
    const minHeight = this.minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
    const canSplitHorizontally = width >= 2 * minWidth;
    const canSplitVertically = height >= 2 * minHeight;

    if (canSplitHorizontally) {
      return 'HORIZONTAL';
    } else if (canSplitVertically) {
      return 'VERTICAL';
    } else {
      return null;
    }
  };

  /**
   * @param start left or top
   * @param dimension width or height
   * @returns the min X/Y coordinate of the *second* room
   */
  _getSplitPoint = (
    start: number,
    dimension: number,
    direction: SplitDirection
  ): number => {
    const minWidth = this.minRoomDimension + ROOM_PADDING[0] + ROOM_PADDING[2];
    const minHeight = this.minRoomDimension + ROOM_PADDING[1] + ROOM_PADDING[3];
    const minRegionDimension = direction === 'HORIZONTAL' ? minWidth : minHeight;
    const minSplitPoint = start + minRegionDimension;
    const maxSplitPoint = start + dimension - minRegionDimension;
    return randInt(minSplitPoint, maxSplitPoint);
  };
}
