import {
  parseKvp, parseGreeting, returnPatterns, findReturn, parseChanged,
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
  test('Returns false if no data passed', () => expect(findReturn()).toBe(false));
  test('Returns false if passed string doesn\'t contain mpd return mark', () => {
    expect(findReturn('Some test message')).toBe(false);
  });
});

describe('Test parseChanged function', () => {
  test('Is defined', () => expect(parseChanged).toBeDefined());
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