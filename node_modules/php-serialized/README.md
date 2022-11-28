# php-serialized v1.2.0

PHP `serialize` and `unserialize` for NodeJS (with **useful error messages**)

```js
const {serialize, unserialize} = require('php-serialized');

serialize([ null ]);
// => 'a:1:{i:0;N;}'

unserialize('a:1:{i:0;N;}');
// => [ [0, null] ]
```

The return value of `unserialize` is always an array.

By default, array nodes are *not* converted in any way.

Pass a function to transform parsed arrays.

```js
unserialize('a:1:{i:0;N;}', (arr) => {
  let res = [];
  for (let i = 0; i < arr.length; i += 2) {
    res[arr[i]] = arr[i + 1];
  }
  return res;
});
// => [ [null] ]
```

*Note:* Serialized class instances are not currently supported. Pull requests are encouraged!

&nbsp;

### `parse(str: string, raw: Function | true): Array<Node>`

Parse a serialized string into an array of AST nodes.

Any syntax errors are returned in an array. The parser will continue until the end is reached or a fatal error is encountered. This means multiple errors can be returned.

When 1+ errors are encountered, the returned array will only contain error nodes. Use `results[0].type !== 'error'` to know if there are no errors.

```js
const {parse} = require('php-serialized-ast');

parse('a:0:{}');
// => [{ type: 'array', value: [], start: 0, end: 6 }]

parse('a:0:{');
// => [{ type: 'error', error: 'Array never closed', start: 0 }]
```

&nbsp;

### `reduce(ast: Array<Node> | Node) : any`

Convert AST nodes to their raw values using the `reduce` function.

Array nodes are *not* converted in any way.

```js
const {reduce, parse} = require('php-serialized-ast');

reduce(parse('a:1:{i:0;N;}')); => [ [0, null] ]
```

*Note:* Doing `reduce(parse(str))` will always be slower than doing `unserialize(str)` because of the intermediate AST nodes.
