package tree_sitter_cds_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_cds "github.com/cap-js-community/tree-sitter-cds/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_cds.Language())
	if language == nil {
		t.Errorf("Error loading CDS grammar")
	}
}
