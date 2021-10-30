type ImageCache = {
  [filename: string]: Promise<ImageData>
};
const CACHE: ImageCache = {};

function _loadImage(filename: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.style.display = 'none';

    const img: HTMLImageElement = document.createElement('img');

    img.addEventListener('load', () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext('2d');
      if (!context) {
        throw 'Couldn\'t get rendering context!';
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
    img.src = `dist/png/${filename}.png`;
  });
}

function loadImage(filename: string): Promise<ImageData> {
  if (CACHE[filename] != null) {
    return CACHE[filename];
  }
  const image: Promise<ImageData> = _loadImage(filename);
  CACHE[filename] = image;
  return image;
}

export default {
  loadImage
};
