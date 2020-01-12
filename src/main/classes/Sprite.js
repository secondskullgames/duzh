{
  /**
   * @param {string} filename
   * @constructor
   */
  function Sprite(filename) {
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      createImageBitmap(img)
        .then(image => {
          this.image = image;
          img.parentElement.removeChild(img);
        });
    });
    img.src = `png/${filename}.png`;
    img.style.display = 'none';
    document.body.appendChild(img);
  }

  window.jwb = window.jwb || {};
  jwb.Sprite = Sprite;
}