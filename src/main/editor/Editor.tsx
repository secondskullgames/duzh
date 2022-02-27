import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Colors } from '../types/Color';
import ColorPicker from './ColorPicker';
import { generateZipBlob, triggerDownload } from './download';
import EditableBitmap from './EditableBitmap';
import styles from './Editor.css';
import ToolPicker, { Tool } from './ToolPicker';

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
  const [selectedTool, setSelectedTool] = useState<Tool>('DRAW');

  return (
    <div className={styles.editor}>
      <div className={styles.topRow}>
        <ToolPicker
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />
        <button onClick={async () => {
          // this isn't Reacty... I don't care
          const canvas = document.querySelector('#editor canvas') as HTMLCanvasElement;
          const zipBlob = await generateZipBlob(canvas);
          triggerDownload(zipBlob);
        }}>
          Save
        </button>
      </div>
      <EditableBitmap
        width={40}
        height={40}
        zoomLevel={zoomLevel}
        mainColor={mainColor}
        altColor={altColor}
        selectedTool={selectedTool}
        setMainColor={setMainColor}
        setAltColor={setAltColor}
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

