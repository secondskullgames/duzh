import Color from './Color';
import jsonColors from '../../../data/colors.json';

const Colors: Record<string, Color> = {};
for (const [name, value] of Object.entries(jsonColors)) {
  Colors[name] = Color.fromHex(value.toLowerCase());
}

export default Colors;
