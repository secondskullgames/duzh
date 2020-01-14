{
  /**
   * @param {string} filename
   * @param {int} dx
   * @param {int} dy
   * @param {string} transparentColor in hex format, e.g. #ffffff
   * @constructor
   */
  function Sprite(filename, { dx, dy }, transparentColor) {
    const { applyTransparentColor } = jwb.utils.ImageUtils;

    /**
     * @type {Promise<ImageBitmap>}
     */
    const _imagePromise = new Promise((resolve, reject) => {
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
        const transparentImageData = applyTransparentColor(imageData, transparentColor);

        // clean up
        img.parentElement.removeChild(img);
        canvas.parentElement.removeChild(canvas);

        return createImageBitmap(transparentImageData)
          .then(imageBitmap => {
            this.image = imageBitmap;
            resolve(imageBitmap);
          });
      });

      //img.style.display = 'none';
      img.onerror = (e) => {
        throw new Error(`Failed to load image ${img.src}`);
      };
      img.style.display = 'none';
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
