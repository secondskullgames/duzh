import Connection from './Connection';
import SplitDirection from '../room_corridor_rewrite/SplitDirection';
import Rect from '@lib/geometry/Rect';
import { checkArgument, checkState } from '@lib/utils/preconditions';

type Props = Readonly<{
  rect: Rect;
  firstSubsection?: Section | null;
  secondSubsection?: Section | null;
  splitDirection?: SplitDirection | null;
  room?: Rect | null;
  connection?: Connection | null;
}>;

/**
 * TODO: Ported from a Java implementation.  I'm not sure I would write it in this style now.
 */
export default class Section {
  readonly rect: Rect;
  readonly firstSubsection: Section | null;
  readonly secondSubsection: Section | null;
  readonly splitDirection: SplitDirection | null;
  readonly room: Rect | null;
  readonly connection: Connection | null;

  constructor({
    rect,
    firstSubsection,
    secondSubsection,
    splitDirection,
    room,
    connection
  }: Props) {
    checkArgument(
      // empty section - no subsections, no room, no connection
      (firstSubsection == null &&
        secondSubsection == null &&
        (splitDirection == null || splitDirection === 'NONE') &&
        room == null &&
        connection == null) ||
        // section with subsections - no room, with or without connection
        (firstSubsection != null &&
          secondSubsection != null &&
          splitDirection != null &&
          splitDirection !== 'NONE' &&
          room == null) ||
        // section with room, no subsections
        (firstSubsection == null &&
          secondSubsection == null &&
          (splitDirection == null || splitDirection === 'NONE') &&
          room != null &&
          connection == null)
    );
    this.rect = rect;
    this.firstSubsection = firstSubsection ?? null;
    this.secondSubsection = secondSubsection ?? null;
    this.splitDirection = splitDirection ?? null;
    this.room = room ?? null;
    this.connection = connection ?? null;
  }

  getLeft = () => this.rect.left;
  getTop = () => this.rect.top;
  getWidth = () => this.rect.width;
  getHeight = () => this.rect.height;

  withSubsections = (
    firstSubsection: Section,
    secondSubsection: Section,
    splitDirection: SplitDirection
  ): Section => {
    checkState(this.room === null);
    return new Section({
      ...this,
      firstSubsection,
      secondSubsection,
      splitDirection
    });
  };

  withRoom = (room: Rect) => {
    checkState(this.firstSubsection === null && this.secondSubsection === null);
    return new Section({ ...this, room, splitDirection: 'NONE' });
  };

  getAllSubsections = (): Section[] => {
    const subsections: Section[] = [];
    const { firstSubsection, secondSubsection } = this;

    if (firstSubsection !== null) {
      subsections.push(firstSubsection);
      for (const subsection of firstSubsection.getAllSubsections()) {
        subsections.push(subsection);
      }
    }
    if (secondSubsection !== null) {
      subsections.push(secondSubsection);
      for (const subsection of secondSubsection.getAllSubsections()) {
        subsections.push(subsection);
      }
    }
    return subsections;
  };
}
