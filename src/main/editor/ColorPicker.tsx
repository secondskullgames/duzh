import React, { MouseEvent } from 'react';
import Color from '../types/Color';
import styles from './ColorPicker.css';

type Props = {
  mainColor: Color,
  altColor: Color,
  colors: Color[],
  setMainColor: (color: Color) => void,
  setAltColor: (color: Color) => void
};

const ColorPicker = ({ mainColor, altColor, colors, setMainColor, setAltColor }: Props) => {
  const swapColors = () => { setMainColor(altColor); setAltColor(mainColor); };
  return (
    <div className={styles.colorPicker}>
      <div className={styles.selectedColors}>
        <ColorBox color={altColor} onLeftClick={swapColors} />
        <ColorBox color={mainColor} onLeftClick={swapColors} />
      </div>
      <div className={styles.colors}>
        {
          colors.map(color => (
            <ColorBox
              color={color}
              onLeftClick={() => setMainColor(color)}
              onRightClick={() => setAltColor(color)}
            />
          ))
        }
      </div>
    </div>
  );
};

type ColorBoxProps = {
  color: Color,
  onLeftClick?: () => void
  onRightClick?: () => void
};

const ColorBox = ({ color, onLeftClick, onRightClick }: ColorBoxProps) => {
  const handleRightClick = (e: MouseEvent) => {
    onRightClick?.();
    e.preventDefault();
  };

  return (
    <div
      className={styles.colorBox}
      style={{ backgroundColor: color }}
      onClick={onLeftClick}
      onContextMenu={handleRightClick}
    />
  );
};

export default ColorPicker;
