tm-node-mpd
============

[![npm](https://img.shields.io/npm/v/tm-node-mpd.svg)](https://www.npmjs.org/package/tm-node-mpd)
[![codecov](https://codecov.io/gh/RomanBurunkov/tm-node-mpd/branch/master/graph/badge.svg?token=8MLYWHWVM9)](https://codecov.io/gh/RomanBurunkov/tm-node-mpd)

This is fork of [node-mpd](https://github.com/Prior99/node-mpd) project by Frederick Gnodtke.

tm-node-mpd is a library for simple communicating with a [music player daemon](http://www.musicpd.org/).
It can use an IPC or TCP-socket to communicate with the daemon and provides a list of highlevel async methods.

Make sure to take a look at the [examples](https://github.com/RomanBurunkov/tm-node-mpd/tree/master/examples).

Note that 0.2 branch was experimental. Do not use is it at all.
Version 1.0.0 has been updated with latest development dependencies and migrated to ECMAScript Modules.

Available options
------

You can pass options object to the MPD constructor.
The following options are available:

* **type** connection type('ipc' or 'network'), default value is 'network'.
* **ipc** path to the unix socket(ipc), default value is '/var/run/mpd/socket'.
* **host** mpd service host, default value is 'localhost'.
* **port** mpd service TCP port, default value is 6600.

Events
------

* ready - Emits after connected to the MPD service.
* error - Emits when any errors occured.
* update - Emits when got any updates from MPD service.
* status - Emits when MPD service status has been updated.
* disconnected - Emits after disconnecting from MPD service.

Methods
------

This part of doc is still in progress.
Please see the source code for all public methods.

* `connect` connects to the mpd.
* `disconnect` disconnects from the mpd.
* `alive` returns true if instance connected to the mpd.
* `command` sends a basic command specified in the first argument. Other arguments will be used as a commant parameters. E.g.

```javascript
  mpd.command('setvol', vol);
```

Example
------
This is a minimal exmaple which connects to a mpd running on localhost on the default port and prints the current playlist:

	const MPD = require('tm-node-mpd');
	const mpd = new MPD(); // pass { type: 'ipc' } to connect local mpd via unix socket.

```javascript
	mpd.on('ready', () => {
		for (let num = 0; num < mpd.playlist.length; num += 1) {
			const n = num + 1;
			console.log(n + ": " + mpd.playlist[num].artist + " - " + mpd.playlist[num].title);
		}
		mpd.disconnect();
	});
```

Make sure to take a look at the [examples](https://github.com/RomanBurunkov/tm-node-mpd/tree/master/examples).

License
-------
Copyright 2015 Frederick Gnodtke
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
