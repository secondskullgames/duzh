import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Color from '../graphics/Color';
import Colors from '../graphics/Colors';
import ColorMapper from './ColorMapper';
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
  const [mappings, setMappings] = useState<Record<string, string>>({});

  const updateMappings = () => {
    const canvas = document.querySelector('#editor canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const colors = new Set<string>();

    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r, g, b, a] = imageData.data.slice(i, i + 4);
      const color = Color.fromRGB({ r, g, b }).hex;
      colors.add(color);
    }

    const updatedMappings = { ...mappings };
    for (const color of colors) {
      if (mappings[color] === undefined) {
        updatedMappings[color] = '';
      }
    }

    for (const color of Object.keys(mappings)) {
      if (!colors.has(color)) {
        delete updatedMappings[color];
      }
    }
    setMappings(updatedMappings);
    console.log('updated mappings');
  };

  useEffect(() => {
    console.log('in useEffect');
    updateMappings();
  }, []);

  return (
    <div className={styles.editor}>
      <div className={styles.topSection}>
        <ToolPicker
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
        />
        <button onClick={async () => {
          const canvas = document.querySelector('#editor canvas') as HTMLCanvasElement;
          const zipBlob = await generateZipBlob(canvas);
          triggerDownload(zipBlob);
        }}>
          Save
        </button>
      </div>
      <div className={styles.mainSection}>
        <div className={styles.leftSection}>
          <EditableBitmap
            width={40}
            height={40}
            zoomLevel={zoomLevel}
            mainColor={mainColor}
            altColor={altColor}
            selectedTool={selectedTool}
            setMainColor={setMainColor}
            setAltColor={setAltColor}
            onChange={updateMappings}
          />
          <ColorPicker
            mainColor={mainColor}
            altColor={altColor}
            colors={colors}
            setMainColor={setMainColor}
            setAltColor={setAltColor}
          />
        </div>
        <div className={styles.rightSection}>
          <ColorMapper
            mappings={mappings}
            setMappings={setMappings}
          />
        </div>
      </div>
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

