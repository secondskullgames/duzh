{
  /**
   * @param {ImageData} imageData
   * @param {string} transparentColor e.g. '#ff0000'
   * @returns {Promise<ImageData>}
   */
  function applyTransparentColor(imageData, transparentColor) {
    return new Promise((resolve, reject) => {
      const [tr, tg, tb] = hex2rgb(transparentColor);
      const array = new Uint8ClampedArray(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const [r, g, b, a] = imageData.data.slice(i, i + 4);
        array[i] = r;
        array[i + 1] = g;
        array[i + 2] = b;
        if (r === tr && g === tg && b === tb) {
          array[i + 3] = 0;
        } else {
          array[i + 3] = a;
        }
      }
      resolve(new ImageData(array, imageData.width, imageData.height));
    });
  }

    /**
   * @param {ImageData} imageData
   * @param {Object<string, string>?} colorMap A map of (hex => hex)
   * @return Promise<ImageData>
   */
  function replaceColors(imageData, colorMap) {
    return new Promise(resolve => {
      if (!colorMap) {
        resolve(imageData);
      }
      const array = new Uint8ClampedArray(imageData.data.length);
      const entries = Object.entries(colorMap);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const [r, g, b, a] = imageData.data.slice(i, i + 4);
        array[i] = r;
        array[i + 1] = g;
        array[i + 2] = b;
        array[i + 3] = a;
        for (let j = 0; j < entries.length; j++) {
          const [srcColor, destColor] = entries[j];
          const [sr, sg, sb] = hex2rgb(srcColor);
          const [dr, dg, db] = hex2rgb(destColor);
          if (r === sr && g === sg && b === sb) {
            array[i] = dr;
            array[i + 1] = dg;
            array[i + 2] = db;
            break;
          }
        }
      }
      resolve(new ImageData(array, imageData.width, imageData.height));
    });
  }

  /**
   * @param {string} hex e.g. '#ff0000'
   * @return {[int, int, int]} [r,g,b]
   */
  function hex2rgb(hex) {
    const div = document.createElement('div');
    div.style.backgroundColor = hex;
    return div.style.backgroundColor
      .split(/[(),]/)
      .map(c => parseInt(c))
      .filter(c => c != null && !isNaN(c));
  }

  window.jwb = window.jwb || {};
  jwb.utils = jwb.utils || {};
  jwb.utils.ImageUtils = {
    applyTransparentColor,
    replaceColors,
    hex2rgb
  };
}
