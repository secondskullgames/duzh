import jsonColors from '../../../data/colors.json';

const Color: { [name: string]: string } = jsonColors;
type Color = string;

export default Color;
export type { Color };
