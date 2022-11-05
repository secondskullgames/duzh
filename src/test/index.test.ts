import { expect, test } from '@jest/globals';
import { setup } from './setup';

test('wat', async () => {
  //await setup();
  expect(2+2).toEqual(4);
});
