import React from 'react';
import Color from '../types/Color';
import styles from './ColorPicker.css';

type Props = {
  mainColor: Color,
  altColor: Color,
  colors: Color[]
};

const ColorPicker = ({ mainColor, altColor }: Props) => {
  return (
    <div className={styles.colorPicker}>
      <div className={styles.title}>Hello, World!</div>
      <ColorBox color={mainColor} />
      <ColorBox color={altColor} />
    </div>
  );
};

type ColorBoxProps = {
  color: Color
};

const ColorBox = ({ color }: ColorBoxProps) => {
  return <div className={styles.box} style={{ backgroundColor: color }} />;
};

export default ColorPicker;
