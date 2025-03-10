# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Upcoming

### Added

- Type definitions now support projection syntax.

### Changed

- [__BREAKING__] Generated bindings via tree-sitter-cli v0.24.0  
  With tree-sitter >=v0.23.0, Rust bindings have changed.
- [__BREAKING__] Rust bindings use tree-sitter v0.25.


## Version 1.0.0 - 2024-06-25

### Added

- Annotations on foreign keys are supported

### Changed

- Updated to tree-sitter v0.22.6
- grammar:
  + Only structured events (+ projections) are allowed, not scalar ones.
  + The grammar was updated and finalized.


## Version 0.0.2 - 2024-03-15

## Changed

- Updated to tree-sitter v0.22.1, which has breaking changes for Node bindings

## Version 0.0.1 - 2023-10-17

### Added

- Initial version

