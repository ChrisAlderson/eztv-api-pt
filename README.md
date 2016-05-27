# eztv-api-pt

A eztv api wrapper to get data from [eztv.ag](https://eztv.ag/).

## Usage

Use with default options:

```js
// Or use 'require'.
import eztvApi from "ezt-api-pt";

// Use the api without any options.
const eztv = eztvApi();
```

Override the default request options:

```js
// Or use 'require'.
import eztvApi from "ezt-api-pt";

// For more options see:
const options = {
  "baseUrl": "https://eztv.ag/",
  "timeout": 3 * 1000
};

// Use the api with options.
const eztv = eztvApi(options);
```

### All shows

Example output of getting all the shows:

```js
[{
    show: '10 O\'Clock Live',
    id: '449',
    slug: '10-o-clock-live'
  }, {
    show: '10 Things I Hate About You',
    id: '308',
    slug: '10-things-i-hate-about-you'
  }, {
    show: '100 Things to Do Before High School',
    id: '1415'
}, ...]
```

### Show data

Example input of getting data from one show:

```js
{
  show: "10 O\'Clock Live",
  id: "449",
  slug: "10-o-clock-live"
}
```

Example output of getting data from one show:

```js
{ show: "10 O\'Clock Live",
  id: "449",
  slug: "tt1811399",
  episodes:
   { "1":
      { "1":
         { "480p":
            { url: "magnet:?xt=urn:btih:LMJXHHNOW33Z3YGXJLCTJZ23WK2D6VO4&dn=10.OClock.Live.S01E01.WS.PDTV.XviD-PVR&tr=udp://tracker.openbittorrent.com:80&tr=udp://open.demonii.com:80&tr=udp://tracker.coppersurfer.tk:80&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://exodus.desync.com:6969",
              seeds: 0,
              peers: 0,
              provider: "EZTV" } },
        ...
      }
    }
```

Nested within the `episodes` property there is the `season number`
within the `season number` is the `episode number` and within the `episode number` are the different `qualities` of the torrent.

# License

MIT License

Copyright (c) 2016 - eztv-api-pt - Released under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
