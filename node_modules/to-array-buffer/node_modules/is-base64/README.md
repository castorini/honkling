# is-base64

Predicate that returns true if base64 string.

[![NPM](https://nodei.co/npm/is-base64.png)](https://nodei.co/npm/is-base64)

# Install

```bash
npm install is-base64
```

```bash
bower install is-base64
```

# Usage

```javascript
var isBase64 = require('is-base64');

var string = 'iVBORw0KGgoAAAAN ... kSuQmCC';
var stringWithMime = 'data:image/png;base64,iVBORw0KGgoAAAA ... AAElFTkSuQmCC';

console.log(isBase64(string)); // true
console.log(isBase64(stringWithMime)); // true
console.log(isBase64('1342234')); // false
console.log(isBase64('afQ$%rfew')); // false
console.log(isBase64('dfasdfr342')); // false
```

# License

MIT
