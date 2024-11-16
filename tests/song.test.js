import Song from '../src/song';

const mockInfo = {
  time: 60,
  date: 'date',
  file: 'song.mp3',
  title: 'song title',
  track: 'song track',
  genre: 'song genre',
  artist: 'song artist',
  lastModified: 'lastModified'
};

test('Song class exist', () => expect(Song).toBeDefined());

test('Test flatCopy', () => {
  const song = new Song(mockInfo);
  expect(song.flatCopy).toBeDefined();
  expect(song.flatCopy()).toEqual(mockInfo);
});