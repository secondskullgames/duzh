import RGB from '../RGB';
import { Pixel } from '../Pixel';

type Props = Readonly<{
  imageData: ImageData,
  filename?: string | null
}>;

export default class Image {
  private constructor(
    private readonly data: ImageData,
    readonly bitmap: ImageBitmap,
    readonly width: number,
    readonly height: number,
    readonly filename: string | null
  ) {}

  getRGB = ({ x, y }: Pixel): RGB => {
    const i = (x * 4) + (y * 4 * this.width);
    const [r, g, b] = this.data.data.slice(i, i + 3);
    return { r, g, b };
  };

  static create = async ({ imageData, filename }: Props): Promise<Image> => {
    const bitmap = await createImageBitmap(imageData);
    return new Image(
      imageData,
      bitmap,
      bitmap.width,
      bitmap.height,
      filename ?? null
    );
  };
}
