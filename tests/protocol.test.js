import {
  parseKvp, parseGreeting, returnPatterns, findReturn, parseChanged, checkResponseStatus, parseStatusResponseValue,
} from '../src/protocol';

describe('Test parseKvp function', () => {
  test('Is defined', () => expect(parseKvp).toBeDefined());
  test('Returns false if no data passed', () => expect(parseKvp()).toBe(false));
  test('Returns false if passed string doesnt match kvp format', () => {
    expect(parseKvp('no kvp')).toBe(false);
  });
  test('Returns false if passed argument is not a string', () => {
    [null, {}, 25, undefined].forEach((arg) => {
      expect(parseKvp(arg)).toBe(false);
    });
  });
  test('Doesnt returns false if passed string matches kvp format', () => {
    expect(parseKvp('vol: 42')).toBeTruthy();
  });
  test('Returned value has key prop if passed string matches kvp format', () => {
    const kvp = parseKvp('vol: 42');
    expect(kvp.key).toBeDefined();
  });
  test('Returned value has val prop if passed string matches kvp format', () => {
    const kvp = parseKvp('vol: 42');
    expect(kvp.val).toBeDefined();
  });
  test('Returns a kvp object if passed string matches kvp format', () => {
    const kvp = parseKvp('vol: 42');
    expect(kvp.key).toBe('vol');
    expect(kvp.val).toBe('42');
  });
  test('Returnse values contain white spaces.', () => {
    expect.assertions(2);
    expect(parseKvp('Artist: Various Artists')).not.toHaveProperty('val', 'Various');
    expect(parseKvp('Title: Lazy fox jumps.')).toHaveProperty('val', 'Lazy fox jumps.');
  });
});

describe('Test parseGreeting function', () => {
  test('Is defined', () => expect(parseGreeting).toBeDefined());
  test('Returns false if no data passed', () => expect(parseGreeting()).toBe(false));
  test('Returns false if passed string doesnt match greetings format', () => {
    expect(parseGreeting('Failed greetings')).toBe(false);
  });
  test('Returns false if passed argument is not a string', () => {
    [null, {}, 25, undefined].forEach((arg) => {
      expect(parseGreeting(arg)).toBe(false);
    });
  });
  test('Doesnt returns false if passed string matches greetings format', () => {
    expect(parseGreeting('OK MPD 0.20.2')).toBeTruthy();
  });
  test('Returned value has name prop if passed string matches greetings format', () => {
    const greeting = parseGreeting('OK MPD 0.20.2');
    expect(greeting.name).toBeDefined();
  });
  test('Returned value has version prop if passed string matches greetings format', () => {
    const greeting = parseGreeting('OK MPD 0.20.2');
    expect(greeting.version).toBeDefined();
  });
  test('Returns a protocol info object if passed string matches greetings format', () => {
    const greeting = parseGreeting('OK MPD 0.20.2');
    expect(greeting.name).toBe('MPD');
    expect(greeting.version).toBe('0.20.2');
  });
});

describe('Test returnPatterns function', () => {
  test('Is defined', () => expect(returnPatterns).toBeDefined());
  test('Returns an array', () => expect(Array.isArray(returnPatterns())).toBe(true));
  test('Returned array is not empty', () => expect(returnPatterns().length).toBeTruthy());
});

describe('Test findReturn function', () => {

  test('Is defined', () => expect(findReturn).toBeDefined());
  test('Returns -1 if no data passed', () => expect(findReturn()).toBe(-1));
  test('Returns -1 if passed string doesn\'t contain mpd return mark', () => {
    expect(findReturn('Some test message')).toBe(-1);
  });

  test('Returns 2 for simple "OK" response', () => {
    expect(findReturn('OK')).toBe(2);
  });

  test('Returns return pattern index for "OK" response with data', () => {
    const resp = "foo: bar\nOK";
    expect(findReturn(resp)).toBe(resp.length);
  });

  test('Returns return pattern index for "ACK" response with an error', () => {
    const errResp = "ACK [5@5] {current_command} message_text";
    expect(findReturn(errResp)).toBe(errResp.length);
  });

});

describe('Test parseChanged function', () => {

  test('parseChanged function should be defined', () => expect(parseChanged).toBeDefined());
  test('Returns an empty array if not acceptable data passed', () => {
    [null, {}, 25, undefined, ''].forEach((arg) => {
      const res = parseChanged(arg);
      expect(Array.isArray(res)).toBeTruthy();
      expect(res.length).toBe(0);
    });
  });
  test('Returns an expected array of changes', () => {
    const mock = 'changed:playlist\nchanged:mixer';
    const result = ['playlist', 'mixer'];
    expect(parseChanged(mock)).toEqual(result);
  });

});

describe('Test checkResponseStatus function', () => {

  test('checkResponseStatus function should be defined', () => {
    expect(checkResponseStatus).toBeDefined();
    expect(typeof checkResponseStatus).toBe('function');
  });

  test('checkResponseStatus should throw an error if nothing passed', () => {
    expect(() => checkResponseStatus()).toThrow('Bad status: "undefined" after command "undefined"');
  });

  test('checkResponseStatus should not throw an error if response status is "OK"', () => {
    expect(() => checkResponseStatus('OK')).not.toThrow();
  });

});

describe('Test parseStatusResponseValue function', () => {

  const boolProperties = ['repeat', 'single', 'random', 'consume'];
  const integerProperties = ['song', 'xfade', 'bitrate', 'playlist', 'playlistlength'];

  test('parseStatusResponseValue function should be defined', () => {
    expect(parseStatusResponseValue).toBeDefined();
    expect(typeof parseStatusResponseValue).toBe('function');
  });

  boolProperties.forEach((prop) => {

    test(`parseStatusResponseValue should return true for { key: '${prop}', val: '1' } KVP`, () => {
      const result = parseStatusResponseValue({ key: prop, val: '1' });
      expect(result).toBe(true);
    });

    test(`parseStatusResponseValue should return false for { key: '${prop}', val: '0' } KVP`, () => {
      const result = parseStatusResponseValue({ key: prop, val: '0' });
      expect(result).toBe(false);
    });

  });

  integerProperties.forEach((prop) => {

    test(`parseStatusResponseValue should return 10 for { key: '${prop}', val: '10' } KVP`, () => {
      const result = parseStatusResponseValue({ key: prop, val: '10' });
      expect(result).toBe(10);
    });

  });

  test('parseStatusResponseValue should return 0.5 for { key: \'volume\', val: \'50%\' } KVP', () => {
    const result = parseStatusResponseValue({ key: 'volume', val: '50%' });
    expect(result).toBe(0.5);
  });

  test('parseStatusResponseValue should return { elapsed: 10, length: 15 } for { key: \'time\', val: \'10:15\' } KVP', () => {
    const result = parseStatusResponseValue({ key: 'time', val: '10:15' });
    expect(result).toEqual({ elapsed: '10', length: '15' });
  });

  test('parseStatusResponseValue should return \'Some Error\' for { key: \'error\', val: \'Some Error\' } KVP', () => {
    const result = parseStatusResponseValue({ key: 'error', val: 'Some Error' });
    expect(result).toBe('Some Error');
  });

});
