import React from 'react';
import styles from './ToolPicker.css';

type Tool = 'DRAW' | 'FILL' | 'PICK';
namespace Tool {
  export const values = (): Tool[] => ['DRAW', 'FILL', 'PICK'];
}

type Props = {
  selectedTool: Tool,
  setSelectedTool: (tool: Tool) => void
};

const ToolPicker = ({ selectedTool, setSelectedTool }: Props) => {
  return (
    <div className={styles.toolPicker}>
      {
        Tool.values().map(tool => (
          <button
            key={tool}
            className={tool === selectedTool ? `${styles.tool} ${styles.selected}` : styles.tool}
            onClick={() => setSelectedTool(tool)}
          >
            {tool}
          </button>
        ))
      }
    </div>
  );
};

export default ToolPicker;
export { Tool };
