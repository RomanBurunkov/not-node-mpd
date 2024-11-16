import Song from '../src/song';

const mockInfo = {
  time: '60',
  date: 'date',
  file: 'song.mp3',
  title: 'song title',
  track: 'song track',
  genre: 'song genre',
  artist: 'song artist',
  lastModified: 'lastModified'
};

const mockKVPs = [
  'OK',
  'Time: 60',
  'Date: date',
  'file: song.mp3',
  'Title: song title',
  'Track: song track',
  'Genre: song genre',
  'Artist: song artist',
  'Last-Modified: lastModified',
];

describe('Tests for Song Class', () => {

  test('Song class exist', () => expect(Song).toBeDefined());

  test('Creating new Song with correct KVP Data should creates a new Song instance', () => {
    const song = new Song(mockKVPs);

    expect(song.flatCopy()).toEqual(mockInfo);
  });

  test('Creating new Song with incorrect KVP Data shoud throw an error', () => {
    expect(() => new Song(['OK', 'QWERTY', ''])).toThrow();
  });

  test('Test for flatCopy method', () => {
    const song = new Song(mockInfo);
    expect(song.flatCopy).toBeDefined();
    expect(song.flatCopy()).toEqual(mockInfo);
  });

});

