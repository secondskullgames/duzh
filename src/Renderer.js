{
  window.jwb = window.jwb || {};

  function render() {
    const { map } = window.jwb.state;
    const container = document.getElementById('container');
    const lines = ['','','']; // extra room for messages
    for (let y = 0; y < map.height; y++) {
      let line = '';
      for (let x = 0; x < map.width; x++) {
        const element = map.getUnit(x, y) || map.getItem(x, y) || map.getTile(x, y);
        line += _renderElement(element);
      }
      lines.push(line);
    }
    lines.push('','','');
    lines.push(_getStatusLine());
    _addActionLines(lines);
    container.innerHTML = lines.map(line => line.padEnd(80, ' ')).join('\n');
  }

  /**
   * @param {Unit | MapItem | Tile} element
   * @private
   */
  function _renderElement(element) {
    if (element instanceof Unit) {
      return `<span style="color: ${(element.name === 'player') ? '#fff' : '#f00'}">@</span>`;
    } else if (element instanceof MapItem) {
      return '$';
    } else if (element instanceof Tile) {
      return element.type.char;
    }
    return ' ';
  }

  function _getStatusLine() {
    const { playerUnit } = window.jwb.state;
    return `HP: ${playerUnit.currentHP}/${playerUnit.maxHP}`;
  }

  /**
   * @param {string[]} lines
   */
  function _addActionLines(lines) {
    const { messages } = window.jwb.state;
    for (let i = 0; i < messages.length; i++) {
      lines[i] = messages.pop();
    }
  }

  window.jwb.Renderer = { render };
}