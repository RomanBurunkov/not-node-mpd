import { Socket } from 'node:net';
import { EventEmitter } from 'node:events';

import Song from './song';
import { parseKvp, parseGreeting, findReturn, parseChanged } from './protocol';
import OptionsFactory from './options.factory';

const RECONNECT_INTERVAL = 5000;
const CONST_FILE_LINE_START = 'file:';
const GENERIC_COMMANDS = ['play', 'stop', 'pause', 'next', 'previous', 'toggle', 'clear'];

const buffer = Symbol('Read buffer');

export default class MPD extends EventEmitter {
  /**
   * MPD connection constructor.
   * @param {Object} options MPD options.
   * @param {string} options.ipc Path to the IPC(Unix Domain Socket).
   * @param {string} options.host MPD service host.
   * @param {number} options.port MPD service TCP port.
   * @param {string} options.type MPD connection type: ipc/network.
   * @param {boolean} options.keepAlive Use keep alive for MPD network connection.
   */
  constructor(options) {
    super();
    // Applying options.
    Object
      .entries(OptionsFactory(options))
      .forEach(([key, val]) => {
        this[key] = val;
      });
    // Init props.
    this.songs = [];
    this.status = {};
    this.server = {};
    this[buffer] = '';
    this.playlist = [];
    this._requests = [];
    this.connected = false;
    this.disconnecting = false;
    this._initGenericCommand();
    this.on('disconnected', () => this.restoreConnection());
  }

  /**
   * Sends a simple command specified in arguments to the mpd instance.
   * First argument should be a command name.
   * All further args will be uses as a command parameters.
   * @returns {Promise}
   */
  command() {
    return this._sendCommand(...arguments)
      .then(r => this._answerCallbackError(r));
  }

  alive() { return this.connected; }

  add(name) { return this.command('add', name); }

  playId(id) { return this.command('play', id); }

  deleteId(id) { return this.command('delete', id); }

  volume(vol) { return this.command('setvol', vol); }

  repeat(repeat) { return this.command('repeat', repeat || 1); }

  crossfade(seconds) { return this.command('crossfade', seconds || 0); }

  seek(songId, time) { return this.command('seek', songId, time); }

  updateSongs() {
    return this._sendCommand('update')
      .then((r) => {
        const arr = r.split(/\n/);
        return this._answerCallbackError(arr[1]);
      });
  }

  searchAdd(search) {
    const args = ['searchadd'];
    for (let key in search) {
      args.push(key);
      args.push(search[key]);
    }
    return this.command(...args);
  }

  /** Initiates connection to the mpd service */
  connect() {
    try {
      this.client = new Socket();
      this.client.setEncoding('utf8');
      this.connected = false;
      this.commanding = true;
      this.disconnecting = false;
      this.client.once('end', () => {
        if (this.disconnecting) return;
        this.connected = false;
        this.emit('disconnected');
      });
      this.client.on('error', (e) => {
        this.connected = false;
        this.emit('error', e);
        this.emit('disconnected');
      });
      this.client.on('connect', () => {
        this.connected = true;
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
        this.client.once('data', data => this._initialGreeting(data));
      });
      // Connecting to the MPD via IPC or TCP.
      this.client.connect(...(this.type === 'ipc' ? [this.ipc] : [this.port, this.host]));
    } catch(e) {
      console.error(e);
      this.restoreConnection();
    }
  }

  restoreConnection() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    this.reconnectInterval = setInterval(() => {
      this.disconnect();
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  disconnect() {
    this.disconnecting = true;
    this.busy = false;
    this._activeListener = null;
    this._requests.splice(0, this._requests.length);
    if (this.client) {
      this.client.destroy();
      delete this.client;
    }
  }

  /* Not so toplevel methods */

  _setReady() {
    this.emit('ready', this.status, this.server);
  }

  _answerCallbackError(msg) {
    if (msg === 'OK') return;
    throw new Error(`Bad status: "${msg}" after command "${this._activeMessage}"`);
  }

  _initGenericCommand() {
    for (let cmd of GENERIC_COMMANDS) {
      this[cmd] = this.command.bind(this, [cmd]);
    }
  }

  _updatePlaylist() {
    return this._sendCommand('playlistinfo')
      .then((message) => {
        const lines = message.split("\n");
        this.playlist = [];
        let songLines = [];
        let pos;
        for (let i = 0; i < lines.length - 1; i += 1) {
          let line = lines[i];
          if (i !== 0 && line.startsWith(CONST_FILE_LINE_START)) {
            this.playlist[pos] = new Song(songLines);
            songLines = [];
            pos = -1;
          }
          if (line.startsWith('Pos')) {
            pos = parseInt(line.split(':')[1].trim());
          } else {
            songLines.push(line);
          }
        }
        if (songLines.length !== 0 && pos !== -1) {
          this.playlist[pos] = new Song(songLines);
        }
        this._answerCallbackError(lines[lines.length - 1]);
        return this.playlist;
      });
  }

  _updateSongs() {
    return this._sendCommand('listallinfo')
      .then((message) => {
        const lines = message.split("\n");
        this.songs = [];
        let songLines = [];
        for (let i = 0; i < lines.length - 1; i += 1) {
          let line = lines[i];
          if (i !== 0 && line.startsWith(CONST_FILE_LINE_START)) {
            this.songs.push(new Song(songLines));
            songLines = [];
          }
          songLines.push(line);
        }
        if(songLines.length !== 0) {
          this.songs.push(new Song(songLines));
        }
        this._answerCallbackError(lines[lines.length - 1]);
        return this.songs;
      });
  }

  _parseStatusResponseValue({ key, val }) {
    switch (key) {
      case 'repeat':
      case 'single':
      case 'random':
      case 'consume': return val === '1';
      case 'song':
      case 'xfade':
      case 'bitrate':
      case 'playlist':
      case 'playlistlength': return parseInt(val, 10);
      case 'volume': return parseFloat(val.replace('%', '')) / 100;
      case 'time': {
        const [elapsed, length] = val.split(':');
        return { elapsed, length };
      }
      default: return val;
    }
  }

  _parseStatusResponse(message) {
    for (let line of message.split("\n")) {
      if (line === 'OK') continue;
      const kvp = parseKvp(line);
      if (kvp === false) {
        throw new Error(`Unknown response while fetching status: ${line}`);
      }
      this.status[kvp.key] = this._parseStatusResponseValue(kvp);
    }
    return this.status;
  }

  updateStatus() {
    return this._sendCommand('status')
      .then(r => this._parseStatusResponse(r));
  }

  /* Message handling */

  /**
   * Initiate MPD connection with greeting message.
   * @param {string} message
   */
  _initialGreeting(message) {
    this.server = parseGreeting(message);
    if (this.server === false) {
      this.restoreConnection();
      throw new Error(`Unexpected greeting message: '${message}'!`);
    }
    if (this.type === 'network' && this.keepAlive) {
      this.client.setKeepAlive(this.keepAlive);
    }
    this.client.on('data', d => this._onData(d));
    this.updateStatus()
      .then(() => this._updateSongs())
      .then(() => this._updatePlaylist())
      .then(() => this._setReady())
      .catch(e => this.emit('error', e));
  }

  _onData(data) {
    if (!this.idling && !this.commanding) return;
    this[buffer] += !data ? '' : data.trim();
    const index = findReturn(this[buffer]);
    if (index === -1) return;
    // We found a return mark
    const string = this[buffer].substring(0, index).trim();
    this[buffer] = this[buffer].substring(index, this[buffer].length);
    if (this.idling) {
      this._onMessage(string);
    } else if (this.commanding) {
      this._handleResponse(string);
    }
  }

  /* Idling */

  _checkIdle() {
    if (this._activeListener || this._requests.length || this.idling) return;
    this._enterIdle();
  }

  _enterIdle() {
    this.idling = true;
    this.commanding = false;
    this._write('idle');
  }

  _leaveIdle(callback) {
    this.client.once('data', () => {
      this.idling = false;
      this.commanding = true;
      callback();
    });
    this._write('noidle');
  }

  /**
   * Handles idle mode updates.
   * @param {string} message Message from MPD.
   */
  async _onMessage(message) {
    try {
      this.idling = false;
      this.commanding = true;
      // It is possible to get a change event or just OK message
      if (message.match(/^\s*OK/)) return;
      const updates = parseChanged(message);
      if (!updates.length) {
        this.restoreConnection();
        throw new Error(`Received unknown message during idle: ${message}`);
      }
      for (const update of updates) {
        const afterUpdate = () => {
          this.emit('update', update);
          this.emit('status', update);
        };
        switch (update) {
          case 'mixer':
          case 'player':
          case 'options':
            await this.updateStatus();
            afterUpdate();
            break;
          case 'playlist':
            await this._updatePlaylist();
            afterUpdate();
            break;
          case 'database':
            await this._updateSongs();
            afterUpdate();
            break;
        }
      }
      this._checkIdle();
    } catch(e) {
      this.emit('error', e);
    }
  }

  /* Sending messages */

  _dequeue(request) {
    this.busy = false;
    this._activeListener = request.callback;
    this._activeMessage = request.message;
    this._write(request.message);
  }

  _checkOutgoing() {
    if (this._activeListener || this.busy) return;
    const request = this._requests.shift();
    if (!request) return;
    this.busy = true;
    return this.idling
      ? this._leaveIdle(() => this._dequeue(request))
      : this._dequeue(request);
  }

  _sendCommand() {
    if (arguments.length === 0) return;
    const cmd = arguments[0];
    let args = '';
    for (let i = 1; i < arguments.length; i += 1) {
      args += ' "' + arguments[i] + '" ';
    }
    return this._send(cmd + args);
  }

  _send(message) {
    return new Promise((resolve, reject) => {
      try {
        this._requests.push({ message, callback: resolve, errorback: reject });
        this._checkOutgoing();
      } catch(e) {
        reject(e);
      }
    });
  }

  _handleResponse(message) {
    if (!this._activeListener) return;
    const callback = this._activeListener;
    this._activeListener = null;
    this._checkOutgoing();
    this._checkIdle();
    callback(message);
  }

  _write(text) {
    try {
      if (!this.connected) {
        this.restoreConnection();
        throw new Error('Disconnect while writing to MPD: ' + text);
      }
      this.client.write(text + "\n");
    } catch(e) {
      this.emit('error', e);
    }
  }
};
