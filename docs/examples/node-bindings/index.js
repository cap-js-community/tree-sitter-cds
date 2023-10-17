'use strict';

const Parser = require('tree-sitter');
const Cds = require('tree-sitter-cds');

const parser = new Parser();
parser.setLanguage(Cds);

const sourceCode = 'entity MyEntity { key id : String; };';
const tree = parser.parse(sourceCode);

const root = tree.rootNode;
const entity = root.child(0);

assert_eq(entity.type, "entity_definition");
assert_eq(entity.nameNode.text, "MyEntity");

function assert_eq(lhs, rhs) {
  if (lhs !== rhs) {
    throw new Error(`${lhs} !== ${rhs}`);
  }
}
