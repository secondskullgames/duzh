{
  /**
   * @param {string} filename
   * @param {int} dx
   * @param {int} dy
   * @constructor
   */
  function Sprite(filename, { dx, dy }) {
    const { applyTransparentColor } = jwb.utils.ImageUtils;
    const TRANSPARENT_COLOR = '#ffffff'; // TODO don't hardcode this

    /**
     * @type {Promise<ImageBitmap>}
     */
    const _imagePromise = new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';

      const img = document.createElement('img');

      img.addEventListener('load', () => {
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, img.width, img.height);
        const transparentImageData = applyTransparentColor(imageData);

        // clean up
        img.parentElement.removeChild(img);
        canvas.parentElement.removeChild(canvas);

        return createImageBitmap(transparentImageData)
          .then(imageBitmap => {
            this.image = imageBitmap;
            resolve(imageBitmap);
          });
      });

      img.src = `png/${filename}.png`;
      img.style.display = 'none';
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