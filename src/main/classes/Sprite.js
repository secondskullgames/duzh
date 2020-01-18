{
  /**
   * @param {string} filename
   * @param {int} dx
   * @param {int} dy
   * @param {string} transparentColor in hex format, e.g. #ffffff
   * @param {Object<string,string> | undefined} paletteSwaps (hex => hex)
   * @constructor
   */
  function Sprite(filename, { dx, dy }, transparentColor, paletteSwaps = {}) {
    const { applyTransparentColor, replaceColors } = jwb.utils.ImageUtils;

    /**
     * @type {Promise<ImageBitmap>}
     */
    const _imagePromise = new Promise(resolve => {
      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';

      /**
       * @type {HTMLImageElement}
       */
      const img = document.createElement('img');

      img.addEventListener('load', () => {
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, img.width, img.height);
        applyTransparentColor(imageData, transparentColor)
          .then(transparentImageData => replaceColors(transparentImageData, paletteSwaps))
          .then(swappedImageData => {
            // clean up
            img.parentElement.removeChild(img);
            canvas.parentElement.removeChild(canvas);

            return createImageBitmap(swappedImageData)
              .then(imageBitmap => {
                this.image = imageBitmap;
                resolve(imageBitmap);
              });
          });
      });

      img.style.display = 'none';
      img.onerror = (e) => {
        throw new Error(`Failed to load image ${img.src}`);
      };
      img.src = `png/${filename}.png`;
      document.body.appendChild(canvas);
      document.body.appendChild(img);
    });

    /**
     * @type {int} dx
     * @type {int} dy
     */
    this.dx = dx;
    this.dy = dy;

    /**
     * @type {ImageBitmap | null}
     */
    this.image = null;

    /**
     * @type {Promise<void>}
     */
    this.whenReady = _imagePromise.then(() => {});
  }

  window.jwb = window.jwb || {};
  jwb.Sprite = Sprite;
}
