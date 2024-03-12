package tree_sitter_cds_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/cap-js-community/tree-sitter-cds"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_cds.Language())
	if language == nil {
		t.Errorf("Error loading CDS grammar")
	}
}
