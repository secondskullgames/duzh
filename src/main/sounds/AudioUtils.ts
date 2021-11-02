import { Sample } from './types';

const transpose8va = ([freq, ms]: Sample): Sample => [freq * 2, ms];
const transpose8vb = ([freq, ms]: Sample): Sample => [freq / 2, ms];

export {
  transpose8va,
  transpose8vb
};
