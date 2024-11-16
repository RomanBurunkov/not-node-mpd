import { parseKvp } from './protocol';

const RES_OK = 'OK';
const ERR_MSG_UNKNOWN = 'Unknown response while parsing song.';

const FIELDS_MAP = new Map([
  ['file', 'file'],
  ['Time', 'time'],
  ['Date', 'date'],
  ['Genre', 'genre'],
  ['Title', 'title'],
  ['Album', 'album'],
  ['Track', 'track'],
  ['Artist', 'artist'],
  ['Last-Modified', 'lastModified'],
]);

export default class Song {
  constructor(data) {
    const info = this._parseInfo(data);
    for (let key in info) {
      this[key] = info[key];
    }
  }

  flatCopy() {
    const obj = {};
    for (let key in this) {
      if (this.__proto__[key] !== undefined) continue;
      obj[key] = this[key];
    }
    return obj;
  }

  _parseInfo(data) {
    if (!Array.isArray(data)) return data;
    const info = {};
    data
      .filter(itm => itm !== RES_OK)
      .forEach((itm) => {
        const kvp = parseKvp(itm);
        if (!kvp) throw new Error(ERR_MSG_UNKNOWN);
        const infoKey = FIELDS_MAP.get(kvp.key);
        if (!infoKey) return;
        info[infoKey] = kvp.val;
      });
    return info;
  }
};
