type Image = {
  bitmap: ImageBitmap,
  data: ImageData,
  width: number,
  height: number
  filename?: string | null
};

type Props = {
  imageData: ImageData,
  filename?: string | null
};

namespace Image {
  export const create = async ({ imageData, filename }: Props): Promise<Image> => {
    const bitmap = await createImageBitmap(imageData);
    return {
      data: imageData,
      bitmap,
      filename,
      width: bitmap.width,
      height: bitmap.height
    };
  };
}

export default Image;
