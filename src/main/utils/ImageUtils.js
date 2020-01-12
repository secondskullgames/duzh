{
  function applyTransparentColor(imageData) {
    const array = new Uint8ClampedArray(imageData.data.length);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r, g, b, a] = imageData.data.slice(i, i + 4);
      array[i] = r;
      array[i + 1] = g;
      array[i + 2] = b;
      if (r === 255 && g === 255 && b === 255) {
        array[i + 3] = 0;
      } else {
        array[i + 3] = a;
      }
    }
    return new ImageData(array, imageData.width, imageData.height);
  }

  window.jwb = window.jwb || {};
  jwb.utils = jwb.utils || {};
  jwb.utils.ImageUtils = {
    applyTransparentColor
  };
}
