{
  /**
   * @param {!string} filename
   * @param {!int} dx
   * @param {!int} dy
   * @param {!string} transparentColor in hex format, e.g. #ffffff
   * @param {Object<string,string> | undefined} paletteSwaps (hex => hex)
   * @constructor
   */
  function Sprite(filename, { dx, dy }, transparentColor, paletteSwaps = {}) {
    this.loading = false;

    const { loadImage, applyTransparentColor, replaceColors } = jwb.utils.ImageUtils;

    /**
     * @type {!Promise<void>}
     * @private
     */
    const _imagePromise = loadImage(filename)
      .then(imageData => applyTransparentColor(imageData, transparentColor))
      .then(imageData => replaceColors(imageData, paletteSwaps))
      .then(imageData => createImageBitmap(imageData))
      .then(imageBitmap => { this.image = imageBitmap; });

    /**
     * @type {!int}
     */
    this.dx = dx;
    /**
     * @type {!int}
     */
    this.dy = dy;

    /**
     * @type {ImageBitmap | null}
     */
    this.image = null;

    /**
     * @type {!Promise<void>}
     */
    this.whenReady = _imagePromise.then(() => new Promise(resolve => { resolve(); }));
  }

  window.jwb = window.jwb || {};
  jwb.Sprite = Sprite;
}
