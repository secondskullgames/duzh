import RGB from '../RGB';
import { Pixel } from '../Pixel';

export type Image = Readonly<{
  bitmap: ImageBitmap;
  width: number;
  height: number;
  filename: string | null;
  getRGB: (pixel: Pixel) => RGB;
}>;

type Props = Readonly<{
  imageData: ImageData;
  filename?: string | null;
}>;

export namespace Image {
  export const create = async ({ imageData, filename }: Props): Promise<Image> => {
    const bitmap = await createImageBitmap(imageData);
    const getRGB = ({ x, y }: Pixel): RGB => {
      const i = x * 4 + y * 4 * imageData.width;
      const [r, g, b] = imageData.data.slice(i, i + 3);
      return { r, g, b };
    };

    return {
      bitmap,
      filename: filename ?? null,
      width: imageData.width,
      height: imageData.height,
      getRGB
    };
  };
}
