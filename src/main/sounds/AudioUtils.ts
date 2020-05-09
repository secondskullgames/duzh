import { Sample } from './types';

function transpose8va([freq, ms]: Sample): Sample {
  return [freq * 2, ms];
}

function transpose8vb([freq, ms]: Sample): Sample {
  return [freq / 2, ms];
}

export {
  transpose8va,
  transpose8vb
};