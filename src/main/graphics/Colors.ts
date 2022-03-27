import jsonColors from '../../../data/colors.json';
import Color from './Color';

const Colors: Record<string, Color> = {};
for (const [name, value] of Object.entries(jsonColors)) {
  Colors[name] = Color.fromHex(value.toLowerCase());
}

export default Colors;
