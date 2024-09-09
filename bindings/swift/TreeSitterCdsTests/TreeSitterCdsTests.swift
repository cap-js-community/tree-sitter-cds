import XCTest
import SwiftTreeSitter
import TreeSitterCds

final class TreeSitterCdsTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_cds())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading CDS grammar")
    }
}
