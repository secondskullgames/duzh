import { Sample } from '@lib/audio/types';

export const transpose8va = ([freq, ms]: Sample): Sample => [freq * 2, ms];
export const transpose8vb = ([freq, ms]: Sample): Sample => [freq / 2, ms];
