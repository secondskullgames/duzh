import React from 'react';
import ReactDOM from 'react-dom';
import { Colors } from '../types/Color';
import ColorPicker from './ColorPicker';

const App = () => {
  return (
    <>
      <ColorPicker mainColor={Colors.RED} altColor={Colors.GREEN} colors={[]} />
    </>
  );
};

const render = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('editor')
  );
};

export default App;
export { render };

