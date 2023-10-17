#include <tree_sitter/parser.h>
#include <wctype.h> // for iswspace()

enum TokenType {
  AUTOMATIC_SEMICOLON,
  DOT_BEFORE_BRACE_OR_ASTERISK
};

// Required by tree-sitter
// Return null or do nothing because we don't carry state.
void *tree_sitter_cds_external_scanner_create() { return NULL; }
void tree_sitter_cds_external_scanner_destroy(void *p) {}
void tree_sitter_cds_external_scanner_reset(void *p) {}
unsigned tree_sitter_cds_external_scanner_serialize(void *p, char *buffer) { return 0; }
void tree_sitter_cds_external_scanner_deserialize(void *p, const char *b, unsigned n) {}

static void consume_whitespace(TSLexer *lexer) {
  for (;;) {
    if (lexer->lookahead == 0) return; // EOF
    if (!iswspace(lexer->lookahead)) return;
    lexer->advance(lexer, true); // true: treat as whitespace
  }
}

/// Check if we can omit a semicolon in the source.
/// A semicolon can be skipped if it is right in front of a closing brace.
static bool scan_automatic_semicolon(TSLexer *lexer) {
  lexer->result_symbol = AUTOMATIC_SEMICOLON;
  lexer->mark_end(lexer);

  for (;;) {
    if (lexer->lookahead == 0) return true; // EOF
    if (lexer->lookahead == '}') return true;
    if (!iswspace(lexer->lookahead)) return false;
    lexer->advance(lexer, true); // skip whitespace
  }
  return false;
}

/// Check if the current char is a dot and is right in front of a brace.
static bool scan_dot_before_brace(TSLexer *lexer) {
  lexer->mark_end(lexer);
  consume_whitespace(lexer);
  if (lexer->lookahead != '.') {
    return false;
  }
  lexer->advance(lexer, false); // now at '.'
  lexer->result_symbol = DOT_BEFORE_BRACE_OR_ASTERISK;
  lexer->mark_end(lexer);

  for (;;) {
    if (lexer->lookahead == 0) return false; // EOF
    if (lexer->lookahead == '*') return true;
    if (lexer->lookahead == '{') return true;
    if (!iswspace(lexer->lookahead)) return false;
    lexer->advance(lexer, true); // true: treat as whitespace
  }
  return false;
}

bool tree_sitter_cds_external_scanner_scan( void *payload, TSLexer *lexer, const bool *valid_symbols)
{
  if (valid_symbols[AUTOMATIC_SEMICOLON]) {
    return scan_automatic_semicolon(lexer);
  }
  if (valid_symbols[DOT_BEFORE_BRACE_OR_ASTERISK]) {
    return scan_dot_before_brace(lexer);
  }
  return false;
}
