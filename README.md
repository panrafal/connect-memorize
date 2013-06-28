connect-memorize [![Build Status](https://travis-ci.org/panrafal/connect-memorize.png)](https://travis-ci.org/panrafal/connect-memorize)
========================
`connect-memorize` allows to store selected middleware responses and serve them later - read - __offline mode__!

This is very handy if:

- you want to have an offline functionality for your backend stuff, especially proxied requests in grunt. 
- you want to store anything your server replied

# Usage

Install

```bash
npm install connect-memorize --save
```

Require

```javascript
var memorize = require('connect-memorize');
```

Setup

```javascript
var app = connect()
  .use(memorize({
        match: /^\/dynamic/, // handle only urls starting with /dynamic
        memorize: true,      // store stuff
        recall: true,        // serve previously stored
  }))
  .use(... any middleware ...)
```

## License
Copyright &copy;2013 Rafal Lindemann
Licensed under the MIT license.
