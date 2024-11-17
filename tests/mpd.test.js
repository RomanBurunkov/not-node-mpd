import { jest } from '@jest/globals';

import Mpd from '../src/mpd';

describe('Test main Mpd class', () => {

  test('Mpd class exist', () => {
    expect(Mpd).toBeDefined();
    expect(typeof Mpd).toBe('function');
  });

});
