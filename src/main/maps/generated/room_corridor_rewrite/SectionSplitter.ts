import { randChoice, randInt } from '../../../utils/random';
import Section from './Section';
import SplitDirection from './SplitDirection';

type Props = Readonly<{
  minRoomWidth: number,
  minRoomHeight: number,
  horizontalSectionPadding: number,
  verticalSectionPadding: number
}>;

interface SectionSplitter {
  splitRecursively: (section: Section) => Section;
}

const createSectionSplitter = ({ minRoomWidth, minRoomHeight, horizontalSectionPadding, verticalSectionPadding }: Props): SectionSplitter => {
  const minSectionWidth = minRoomWidth + horizontalSectionPadding * 2 + 1;
  const minSectionHeight = minRoomHeight + verticalSectionPadding * 2 + 1;

  const splitRecursively = (section: Section): Section => {
    const canSplitHorizontally = section.getWidth() >= minSectionWidth * 2;
    const canSplitVertically = section.getHeight() >= minSectionHeight * 2;

    const splitDirection = _pickSplitDirection(canSplitHorizontally, canSplitVertically);

    switch (splitDirection) {
      case 'HORIZONTAL':
        return _splitHorizontally(section);
      case 'VERTICAL':
        return _splitVertically(section);
      case 'NONE':
        return _addRoom(section);
    }
  };

  const _pickSplitDirection = (canSplitHorizontally: boolean, canSplitVertically: boolean): SplitDirection => {
    if (canSplitHorizontally && canSplitVertically) {
      return randChoice(['HORIZONTAL', 'VERTICAL']);
    } else if (canSplitHorizontally) {
      return 'HORIZONTAL';
    } else if (canSplitVertically) {
      return 'VERTICAL';
    } else {
      return 'NONE';
    }
  };

  const _splitHorizontally = (section: Section): Section => {
    const leftWidth = randInt(minSectionWidth, section.getWidth() - minSectionWidth);
    const left = new Section({
      rect: { ...section.rect, width: leftWidth }
    });

    const right = new Section({
      rect: { ...section.rect, left: section.rect.left + leftWidth, width: section.rect.width - leftWidth }
    });

    return section.withSubsections(
      splitRecursively(left),
      splitRecursively(right),
      'HORIZONTAL'
    );
  };

  const _splitVertically = (section: Section): Section => {
    const topHeight = randInt(minSectionHeight, section.rect.height - minSectionHeight);
    const top = new Section({
      rect: { ...section.rect, height: topHeight }
    });

    const bottom = new Section({
      rect: { ...section.rect, top: section.rect.top + topHeight, height: section.rect.height - topHeight }
    });

    return section.withSubsections(
      splitRecursively(top),
      splitRecursively(bottom),
      'VERTICAL'
    );
  };

  const _addRoom = (section: Section): Section => {
    const sectionRight = section.getLeft() + section.getWidth();
    const sectionBottom = section.getTop() + section.getHeight();

    const minLeft = section.getLeft() + horizontalSectionPadding + 1;
    const maxLeft = sectionRight - horizontalSectionPadding - minRoomWidth;
    const minTop = section.getTop() + verticalSectionPadding + 1;
    const maxTop = sectionBottom - verticalSectionPadding - minRoomHeight;

    const left = randInt(minLeft, maxLeft);
    const top = randInt(minTop, maxTop);
    const maxRoomWidth = sectionRight - horizontalSectionPadding - left;
    const width = randInt(minRoomWidth, maxRoomWidth);
    const maxRoomHeight = sectionBottom - verticalSectionPadding - top;
    const height = randInt(minRoomHeight, maxRoomHeight);

    return section.withRoom({ left, top, width, height });
  };

  return { splitRecursively };
};

namespace SectionSplitter {
  export const create = createSectionSplitter;
}

export default SectionSplitter;
