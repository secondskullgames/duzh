import { createCanvas, createImage, getCanvasContext } from '../../utils/dom';

const loadImage = async (filename: string): Promise<ImageData | null> => {
  let image: string;
  try {
    image = (await import(
      /* webpackMode: "lazy-once" */
      /* webpackChunkName: "images" */
      `../../../../png/${filename}.png`
    )).default;
  } catch {
    // this is expected for _B filenames
    return null;
  }

  return new Promise((resolve, reject) => {
    const img = createImage();

    img.addEventListener('load', () => {
      const canvas = createCanvas({
        width: img.width,
        height: img.height
      });
      canvas.style.display = 'none';
      const context = getCanvasContext(canvas);
      if (!context) {
        throw new Error('Couldn\'t get rendering context!');
      }
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, img.width, img.height);
      if (img.parentElement) {
        img.parentElement.removeChild(img);
      }
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
      resolve(imageData);
    });

    img.style.display = 'none';
    img.onerror = () => {
      reject(`Failed to load image ${img.src}`);
    };
    img.src = image;
  });
};

export default {
  loadImage
};
