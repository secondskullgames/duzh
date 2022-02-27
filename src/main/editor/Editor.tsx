import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Colors } from '../types/Color';
import ColorPicker from './ColorPicker';
import EditableBitmap from './EditableBitmap';
import styles from './Editor.css';

const colors = [
  Colors.BLACK,
  Colors.WHITE,
  Colors.DARK_GRAY,
  Colors.LIGHT_GRAY,
  Colors.DARK_RED,
  Colors.RED,
  Colors.DARK_YELLOW,
  Colors.YELLOW,
  Colors.DARK_GREEN,
  Colors.GREEN,
  Colors.DARK_TEAL,
  Colors.CYAN,
  Colors.DARK_BLUE,
  Colors.BLUE,
  Colors.DARK_PURPLE,
  Colors.MAGENTA
];

const Editor = () => {
  const [mainColor, setMainColor] = useState(Colors.BLACK);
  const [altColor, setAltColor] = useState(Colors.WHITE);
  const [zoomLevel] = useState(16);

  return (
    <div className={styles.editor}>
      <EditableBitmap
        width={40}
        height={40}
        zoomLevel={zoomLevel}
        mainColor={mainColor}
        altColor={altColor}
      />
      <ColorPicker
        mainColor={mainColor}
        altColor={altColor}
        colors={colors}
        setMainColor={setMainColor}
        setAltColor={setAltColor}
      />
    </div>
  );
};

const render = () => {
  ReactDOM.render(
    <React.StrictMode>
      <Editor />
    </React.StrictMode>,
    document.getElementById('editor')
  );
};

export default Editor;
export { render };

