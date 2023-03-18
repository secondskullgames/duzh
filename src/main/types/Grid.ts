import Coordinates from '../geometry/Coordinates';
import { checkArgument } from '../utils/preconditions';

type Props = Readonly<{
  width: number,
  height: number
}>;

export default class Grid<T> {
  private readonly width: number;
  private readonly height: number;
  private readonly array: (T[])[][];

  constructor({ width, height }: Props) {
    this.width = width;
    this.height = height;
    this.array = [];

    for (let y = 0; y < height; y++) {
      this.array[y] = [];
      for (let x = 0; x < width; x++) {
        this.array[y][x] = [];
      }
    }
  }

  get = ({ x, y }: Coordinates): T[] => {
    checkArgument(this._contains({ x, y }));
    return this.array[y][x];
  };

  put = ({ x, y }: Coordinates, item: T) => {
    checkArgument(this._contains({ x, y }));
    this.array[y][x].push(item);
  };

  remove = ({ x, y }: Coordinates, item: T) => {
    checkArgument(this._contains({ x, y }));
    const items = this.array[y][x];
    const index = items.indexOf(item);
    if (index > -1) {
      items.splice(index);
    }
  };

  private _contains = ({ x, y }: Coordinates): boolean => {
    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
  };
};