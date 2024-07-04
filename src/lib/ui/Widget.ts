import { Rect } from '@lib/geometry/Rect';

export interface Widget {
  readonly id: string;
  readonly rect: Rect;
  render: () => Promise<ImageData>;
  onClick: () => Promise<void>;
}
