const DIGIT = '0123456789';
const STRING = /^"[\s\S]*"$/;

const types = {
  a: 'array',
  b: 'boolean',
  d: 'double',
  i: 'integer',
  s: 'string',
  N: 'null',
};

function parse(str, raw) {
  let stack = []; // array stack
  let nodes = []; // current array
  let n = Infinity; // array length
  let o = 0;        // array offset

  let errors = [];
  NODES: for (let i = 0; i < str.length; i++) {
    let ch = str.charAt(i);
    if (ch == '') break;

    let error, type, value, start = i;
    NODE: do {

      // Look for a value type.
      type = types[ch];
      if (!type) {
        // Array may be closed too early.
        if (ch == '}') {
          if (errors.length) break NODES;
          if (stack.length) {
            type = 'array';
            error = 'Array closed too early';
            break;
          }
        }
        error = 'Unexpected char: ' + ch;
        break;
      }

      // Null values are easy.
      if (ch == 'N') {
        value = null;
        break;
      }

      // Arrays and strings have a length.
      let length = '';
      if (ch == 'a' || ch == 's') {

        // Look for a colon.
        ch = str.charAt(++i);
        if (ch != ':') {
          error = 'Missing colon';
          break;
        }

        // Look for the length.
        while (~DIGIT.indexOf(ch = str.charAt(++i))) {
          length += ch;
        }
        length = Number(length);
      }
      else {
        ch = str.charAt(++i);
      }

      // Look for a colon.
      if (ch != ':') {
        error = 'Missing colon';
        break;
      }

      // Look for the value.
      ch = str.charAt(++i);
      switch (type) {
        case 'array':
          if (ch != '{') {
            error = 'Array never opened';
            break NODE;
          }
          i++;

          // Preserve parent array.
          stack.push([nodes, n, o]);

          // Create our array.
          nodes = [];
          n = (2 * length) + 1;
          o = start;
          break;

        case 'boolean':
          if (ch != '0' && ch != '1') {
            error = 'Invalid boolean value (must be 0 or 1)';
            break NODE;
          }
          i++;
          value = ch == '1';
          break;

        case 'double':
          value = str.slice(i, str.indexOf(';', i));
          if (isNaN(parseFloat(value))) {
            error = 'Invalid double value';
            break NODE;
          }
          i += value.length;
          value = parseFloat(value);
          break;

        case 'integer':
          value = str.slice(i, str.indexOf(';', i));
          if (isNaN(parseInt(value))) {
            error = 'Invalid integer value';
            break NODE;
          }
          i += value.length;
          value = parseInt(value);
          break;

        case 'string':
          value = str.substr(i, length += 2);
          if (!STRING.test(value)) {
            error = 'Invalid string value';
            break NODE;
          }
          i += length;
          value = value.slice(1, -1);
          break;
      }
      i--;

    // Parse the next node.
    } while (0);

    if (!error) {
      // Look for a semicolon.
      if (type != 'array') {
        ch = str.charAt(++i);
        if (ch != ';') {
          error = 'Missing semicolon';
        }
        else if (raw) {
          nodes.push(value);
        }
        else {
          nodes.push({
            type,
            value,
            start,
            end: i + 1,
          });
        }
      }

      // Look for closed arrays.
      while (--n == 0) {
        ch = str.charAt(++i);

        if (ch == '') {
          i = o;
          type = 'array';
          error = 'Array never closed';
          break;
        }

        if (ch != '}') {
          type = 'array';
          error = 'Array length exceeded';
          break;
        }

        let parent = stack.pop();
        if (!parent) {
          type = 'array';
          error = 'Unexpected char: }';
          break;
        }

        // Create an array node.
        let node = raw ? nodes : {
          type: 'array',
          value: nodes,
          start: o,
          end: i + 1,
        };

        // Raw mode may use an array transformer.
        if (typeof raw == 'function') {
          node = raw(node);
        }

        // Restore the parent array.
        [nodes, n, o] = parent;
        nodes.push(node);
      }
    }

    if (error) {
      // Throw the error in raw mode.
      if (raw) {
        let e = SyntaxError(error);
        e.start = i;
        throw e;
      }

      // Push an error node and keep going.
      let node = {
        type: 'error',
        error,
        start: i,
      };
      nodes.push(node);
      errors.push(node);

      // Continuing past array errors is hard.
      if (type == 'array') {
        break;
      }

      // Find a semicolon.
      while (true) {
        if (ch == ';') {
          if (type != 'string') break;
          if (str[i - 1] == '"') break;
        }
        ch = str.charAt(++i);
        if (ch == '') break;
      }

      // Reset the `error` variable.
      error = null;
    }
  }

  if (errors.length) {
    return errors;
  }

  // Detect unfinished arrays.
  if (stack.length && n > 0) {
    errors.push({
      type: 'error',
      error: 'Array never finished',
      start: o,
    });
    return errors;
  }

  return nodes;
}

exports.parse = parse;
exports.reduce = require('./reduce');
exports.serialize = require('./serialize');
exports.unserialize = (str, fn) => parse(str, fn || true);
