import { parseKvp } from './protocol';

const RES_OK = 'OK';
const ERR_MSG_UNKNOWN = 'Unknown response while parsing song.';

const FIELD_MAP = [
  { key: 'file', val: 'file' },
  { key: 'time', val: 'Time' },
  { key: 'date', val: 'Date' },
  { key: 'genre', val: 'Genre' },
  { key: 'title', val: 'Title' },
  { key: 'album', val: 'Album' },
  { key: 'track', val: 'Track' },
  { key: 'artist', val: 'Artist' },
  { key: 'lastModified', val: 'Last-Modified' }
];

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
        const fieldInfo = FIELD_MAP.find(fldKvp => fldKvp.val === kvp.key);
        if (!fieldInfo) return;
        info[fieldInfo.key] = kvp.val;
      });
    return info;
  }
};
