'use strict';

const Parser = require('tree-sitter');
const Cds = require('@cap-js-community/tree-sitter-cds');

const parser = new Parser();
parser.setLanguage(Cds);

const sourceCode = 'entity Test { key ID : UUID; };';
const tree = parser.parse(sourceCode);

assertEq(tree.rootNode.child(0).type, 'entity_definition');
assertEq(tree.rootNode.child(0).nameNode.text, 'Test');

function assertEq(actual, expected) {
  if (expected !== actual) {
    throw new Error(`assertion failed: ${actual} === ${expected}`)
  }
}
