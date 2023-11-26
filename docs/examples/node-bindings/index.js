const Parser = require('tree-sitter');
const Cds = require('@cap-js-community/tree-sitter-cds');

const parser = new Parser();
parser.setLanguage(Cds);

const sourceCode = 'entity MyEntity { key id : String; };';
const tree = parser.parse(sourceCode);

const root = tree.rootNode;
const entity = root.child(0);

assertEq(entity.type, 'entity_definition');
assertEq(entity.nameNode.text, 'MyEntity');

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

