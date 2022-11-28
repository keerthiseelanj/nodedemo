const hop = Object.hasOwnProperty;

function serialize(val) {
  return function serialize(val) {
    if (val === null) {
      return 'N;';
    }
    let type = typeof val;
    if (type == 'object') {
      let obj = val, vals = [];
      for (let key in obj) {
        if (!hop.call(obj, key)) continue;
        val = obj[key];
        if (val !== undefined && typeof val != 'function') {
          vals.push(serialize(key), serialize(val));
        }
      }
      return 'a:' + (vals.length / 2) + ':{' + vals.join('') + '}';
    }
    switch (type) {
      case 'string':
        return 's:' + val.length + ':"' + val + '";';
      case 'number':
        return (Math.floor(val) === val ? 'i:' : 'd:') + val + ';';
      case 'boolean':
        return 'b:' + (val ? 1 : 0) + ';';
    }
  }(val);
}

module.exports = serialize;
