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

    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';

    const img = document.createElement('img');

    img.addEventListener('load', () => {
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, img.width, img.height);
      const transparentImageData = applyTransparentColor(imageData);
      createImageBitmap(transparentImageData)
        .then(imageBitmap => this.image = imageBitmap);

      // clean up
      img.parentElement.removeChild(img);
      canvas.parentElement.removeChild(canvas);
    });
    img.src = `png/${filename}.png`;
    img.style.display = 'none';
    document.body.appendChild(canvas);
    document.body.appendChild(img);

    /**
     * @type {ImageBitmap | null}
     */
    this.image = null;
    /**
     * @type {int} dx
     * @type {int} dy
     */
    this.dx = dx;
    this.dy = dy;
  }

  window.jwb = window.jwb || {};
  jwb.Sprite = Sprite;
}