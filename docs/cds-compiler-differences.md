# Differences to the official `@sap/cds-compiler` Grammar

This project aims to support CDS _syntax highlighting_.  This also means that
we want syntax highlighting for "slightly incorrect" sources.  Therefore, we
simplified the grammar a bit so that it accepts _more_ than the official
grammar.  For example, we don't enforce that `namespace a.b.c;` appears before
artifact definitions.  The syntax highlighter should still work with such code.

Furthermore, the official `@sap/cds-compiler` project allows more constructs
than tree-sitter-cds.  That's because `@sap/cds-compiler` has put a lot of work
into allowing keywords as identifiers at places that tree-sitter-cds does not
allow or possibly can't allow.  

That is, tree-sitter-cds does not allow to use certain keywords as identifiers,
for example, `many` and `array` can't be used as unquoted identifiers, only as
quoted ones such as `![many]`.

We also restrict some constructs to make the tree-sitter grammar easier to read
and to avoid custom lexer coding.  Differences include, but are not limited to:

 - Queries: expand/inline: no space/comments between `.` and `*`/`{`  
   `field.{` is valid, but `field. {` is not.
