import Coordinates from '../geometry/Coordinates';
import { checkArgument, checkState } from '../utils/preconditions';

type Props = Readonly<{
  width: number;
  height: number;
}>;

export default class Grid<T> {
  private readonly width: number;
  private readonly height: number;
  private readonly array: T[][];

  constructor({ width, height }: Props) {
    this.width = width;
    this.height = height;
    this.array = [];

    for (let y = 0; y < height; y++) {
      this.array[y] = [];
    }
  }

  get = (coordinates: Coordinates): T | null => {
    checkArgument(this.contains(coordinates));
    const { x, y } = coordinates;
    return this.array[y][x] ?? null;
  };

  put = (coordinates: Coordinates, item: T) => {
    checkArgument(this.contains(coordinates));
    const { x, y } = coordinates;
    this.array[y][x] = item;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove = (coordinates: Coordinates, item: T) => {
    checkArgument(this.contains(coordinates));
    const { x, y } = coordinates;
    checkState(!!this.array[y][x]);
    delete this.array[y][x];
  };

  getAll = (): T[] => {
    return Object.values(this.array).flat();
  };

  contains = ({ x, y }: Coordinates): boolean => {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  };
}
