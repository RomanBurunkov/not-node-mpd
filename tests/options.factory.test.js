import OptionsFactory from "../src/options.factory";

const mockDefaultOptions = {
  host: 'localhost',
  ipc: '/var/run/mpd/socket',
  keepAlive: false,
  port: 6600,
  type: 'network',
}

describe('Tests for Options Factory', () => {

  test('OptionsFactory class exist', () => {
    expect(OptionsFactory).toBeDefined();
    expect(typeof OptionsFactory).toBe('function');
  });

  test('OptionsFactory has static create method', () => {
    expect(OptionsFactory.create).toBeDefined();
    expect(typeof OptionsFactory.create).toBe('function');
  });

  test('create method should return default configuration if no user options has been passed', () => {
    const options = OptionsFactory.create();

    expect(options).toEqual(mockDefaultOptions);
  });

  test('create method should return default configuration if empty user options has been passed', () => {
    const options = OptionsFactory.create({});

    expect(options).toEqual(mockDefaultOptions);
  });

  test('User should be able to override default settings', () => {

    const userOptions = {
      type: 'ipc',
      keepAlive: true,
      ipc: '/var/run/mpd/socket1',
    };

    const options = OptionsFactory.create(userOptions);

    expect(options).toEqual({
      ...mockDefaultOptions,
      ...userOptions,
    });
  })

});
