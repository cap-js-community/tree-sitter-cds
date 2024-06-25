# tree-sitter-cds

This crate provides CDS language support for the [tree-sitter][] parsing library.

Typically, you will use the [language][language func] function to add this language
to a tree-sitter [Parser][], and then use the parser to parse some code:

To use this crate, add it to the `[dependencies]` section of your
`Cargo.toml` as well as [`tree-sitter`][tree-sitter crate].

``` toml
[dependencies]
tree-sitter = "~0.20"
tree-sitter-cds = "~1.0.0"
```

The below example demonstrates a simple program that parses a CDS
function and prints the result to your terminal.

```rust
use tree_sitter::Parser;

fn main() {
    let code = r#"
    entity MyEntity {
      key id : String;
    }
"#;
    let mut parser = Parser::new();
    parser
        .set_language(tree_sitter_cds::language())
        .expect("Error loading CDS grammar");
    let parsed = parser.parse(code, None);
    println!("{:#?}", parsed);
}
```


[language func]: https://docs.rs/tree-sitter-javascript/*/tree_sitter_cds/fn.language.html
[Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
[tree-sitter]: https://tree-sitter.github.io/
[tree-sitter crate]: https://crates.io/crates/tree-sitter
