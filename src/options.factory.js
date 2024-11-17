
const DEF_PORT = 6600;
const DEF_HOST = 'localhost';
const DEF_SOCKET = '/var/run/mpd/socket';
const DEF_CONN_TYPE = 'network';
const DEF_KEEP_ALIVE = false;

const CONN_TYPES = new Set(['ipc', 'network']);

export default class OptionsFactory {

  /**
   * Combines default and user's to create full Mpd configuration.
   * @param {Object} options User's options.
   * @param {string} options.ipc Path to the IPC(Unix Domain Socket).
   * @param {string} options.host MPD service host.
   * @param {number} options.port MPD service TCP port.
   * @param {string} options.type MPD connection type: ipc/network.
   * @param {boolean} options.keepAlive Use keep alive for MPD network connection.
   * @returns {Object} Mpd configuration.
   */
  static create(options) {
    const opts = options || {};

    return {
      ipc: opts.ipc || DEF_SOCKET,
      host: opts.host || DEF_HOST,
      port: opts.port || DEF_PORT,
      type: CONN_TYPES.has(opts.type) ? opts.type : DEF_CONN_TYPE,
      keepAlive: !!opts.keepAlive || DEF_KEEP_ALIVE,
    };
  }
}
