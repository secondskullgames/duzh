import jsonColors from '../../../data/colors.json';

// I think this declaration merging works even though IntelliJ disagrees
const Color: { [name: string]: string } = jsonColors;
type Color = string;

export default Color;
