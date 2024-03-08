import Rect from '@lib/geometry/Rect';
/**
 * An area of a map where a room can potentially be placed, possibly with some amount of padding.
 */

type RoomRegion = {
  // these are in absolute coordinates
  rect: Rect;
  roomRect: Rect | null;
};

namespace RoomRegion {
  export const toString = ({ rect: { left, top, width, height } }: RoomRegion) =>
    `(${left}, ${top}, ${width}, ${height})`;
}

export default RoomRegion;
