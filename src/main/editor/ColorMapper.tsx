import React from 'react';
import Color from '../types/Color';
import styles from './ColorMapper.css';

type Props = {
  mappings: Record<Color, string>,
  setMappings: (mappings: Record<Color, string>) => void
};

const ColorMapper = ({ mappings, setMappings }: Props) => {
  return (
    <div className={styles.container}>
      <table>
        <thead>
          <tr>
            <th>Color</th>
            <th>Hex value</th>
            <th>Object Name*</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(mappings).map(([ color, objectName ]) => (
              <tr key={color}>
                <td style={{ backgroundColor: color }} />
                <td>{color}</td>
                <td>
                  <input
                    type="text"
                    value={objectName}
                    onChange={e => {
                      const updatedMappings = {
                        ...mappings,
                        [color]: e.target.value
                      };
                      console.log(updatedMappings);
                      setMappings(updatedMappings);
                    }}
                  />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default ColorMapper;
