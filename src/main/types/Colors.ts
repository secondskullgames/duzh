import jsonColors from '../../../data/colors.json';

const Colors: {[name: string]: string} = jsonColors;
type Color = string;

export default Colors;
export type { Color };