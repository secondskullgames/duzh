const loadImage = async (filename: string): Promise<ImageData | null> => {
  let image: string;
  try {
    image = (await import(
      /* webpackMode: "lazy-once" */
      /* webpackChunkName: "png" */
      `../../../../png/${filename}.png`
    )).default;
  } catch {
    // this is expected for _B filenames
    return null;
  }

  return new Promise((resolve, reject) => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.style.display = 'none';

    const img: HTMLImageElement = document.createElement('img');

    img.addEventListener('load', () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext('2d');
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
