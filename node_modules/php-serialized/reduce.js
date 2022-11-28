
function reduce(ast) {
  return Array.isArray(ast) ?
    ast.map(reduceNode) : reduceNode(ast);
}

function reduceNode(node) {
  if (node.type == 'error') {
    let e = new Error(node.value);
    e.start = node.start;
    throw e;
  }
  if (node.type == 'array') {
    return node.value.map(reduceNode);
  }
  return node.value;
}

module.exports = reduce;
