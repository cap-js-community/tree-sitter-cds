# Stack Graphs

The GitHub [stack-graphs][1] integration is for testing only.
It is not a proper implementation for CDS, but only intended for testing
and demonstrating tree-sitter capabilities.

## Example

```sh
cargo install --features cli tree-sitter-stack-graphs
tree-sitter-stack-graphs test --output-mode always \
  --show-ignored \
  --tsg stack-graphs/cds.tsg \
  -V \
  stack-graphs/stack-graph-example.cds
```

## Resources

 - <https://github.com/github/stack-graphs>
 - <https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax>

[1]: https://github.com/github/stack-graphs
