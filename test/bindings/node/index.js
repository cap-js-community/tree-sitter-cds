const Parser = require('tree-sitter');
const Cds = require('@cap-js-community/tree-sitter-cds');

const parser = new Parser();
parser.setLanguage(Cds);

const sourceCode = 'entity Test { key ID : UUID; };';
const tree = parser.parse(sourceCode);

assertEq(tree.rootNode.child(0).type, 'entity_definition');
assertEq(tree.rootNode.child(0).nameNode.text, 'Test');

/**
 * Assert that the lhs is equal to the rhs.
 *
 * @param {any} lhs
 * @param {any} rhs
 */
function assertEq(lhs, rhs) {
  if (lhs !== rhs) {
    throw new Error(`assertion failed: ${lhs} === ${rhs}`);
  }
}
