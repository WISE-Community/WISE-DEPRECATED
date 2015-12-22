# err-code [![Build Status](https://travis-ci.org/IndigoUnited/node-err-code.svg?branch=master)](https://travis-ci.org/IndigoUnited/node-err-code)


Create new error instances with a code.


## Installation

`$ npm install err-code`


## Why

I find myself doing this repeatedly:

```js
var err = new Error('My message');
err.code = 'ESOMECODE';
throw err;
```

## Usage

Simple usage.

```js
var errcode = require('err-code');

throw errcode('My message', 'ESOMECODE');
```

Other custom properties

```js
var errcode = require('err-code');

throw errcode('My message', 'ESOMECODE', { some: 'property' });
```

Fill error object with a code and properties

```js
var errcode = require('err-code');

throw errcode(new Error('My message'), 'ESOMECODE', { some: 'property' });
```


## Tests

`$ npm test`


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
