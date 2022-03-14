import {IndexedRegexToken} from "../../model/token/indexed-regex-token";
import DefaultRegexToken from "../../model/token/regex-token";
import {Lexer} from "./lexer";

test.each([
    {
        s: 'abc',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.character('a'), 0),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 1),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 2),
            new IndexedRegexToken(DefaultRegexToken.eof(), 3),
        ]
    },
    {
        s: '[abc]',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.characterClassStart(), 0),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 1),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 2),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 3),
            new IndexedRegexToken(DefaultRegexToken.characterClassEnd(), 4),
            new IndexedRegexToken(DefaultRegexToken.eof(), 5),
        ]
    },
    {
        s: '(abc)',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.groupStart(), 0),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 1),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 2),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 3),
            new IndexedRegexToken(DefaultRegexToken.groupEnd(), 4),
            new IndexedRegexToken(DefaultRegexToken.eof(), 5),
        ]
    },
    {
        s: '(?:abc)',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.nonCapturingGroupStart(), 0, 2),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 3),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 4),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 5),
            new IndexedRegexToken(DefaultRegexToken.groupEnd(), 6),
            new IndexedRegexToken(DefaultRegexToken.eof(), 7),
        ]
    },
    {
        s: '(?<=abc)',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.lookbehindGroupStart(), 0, 3),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 4),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 5),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 6),
            new IndexedRegexToken(DefaultRegexToken.groupEnd(), 7),
            new IndexedRegexToken(DefaultRegexToken.eof(), 8),
        ]
    },
    {
        s: '(?<!abc)',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.lookbehindGroupStart(true), 0, 3),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 4),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 5),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 6),
            new IndexedRegexToken(DefaultRegexToken.groupEnd(), 7),
            new IndexedRegexToken(DefaultRegexToken.eof(), 8),
        ]
    },
    {
        s: '(?=abc)',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.lookaheadGroupStart(), 0, 2),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 3),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 4),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 5),
            new IndexedRegexToken(DefaultRegexToken.groupEnd(), 6),
            new IndexedRegexToken(DefaultRegexToken.eof(), 7),
        ]
    },
    {
        s: '(?!abc)',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.lookaheadGroupStart(true), 0, 2),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 3),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 4),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 5),
            new IndexedRegexToken(DefaultRegexToken.groupEnd(), 6),
            new IndexedRegexToken(DefaultRegexToken.eof(), 7),
        ]
    },
    {
        s: '\\w',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.escaped('w'), 0, 1),
            new IndexedRegexToken(DefaultRegexToken.eof(), 2),
        ]
    },
    {
        s: '\\w|abc',
        expected: [
            new IndexedRegexToken(DefaultRegexToken.escaped('w'), 0, 1),
            new IndexedRegexToken(DefaultRegexToken.alternative(), 2),
            new IndexedRegexToken(DefaultRegexToken.character('a'), 3),
            new IndexedRegexToken(DefaultRegexToken.character('b'), 4),
            new IndexedRegexToken(DefaultRegexToken.character('c'), 5),
            new IndexedRegexToken(DefaultRegexToken.eof(), 6),
        ]
    }
])('should correctly scan given string to lexems: %s', ({s, expected}) => {
    const lexer = new Lexer()
    lexer.load(s)
    let res = []
    while(lexer.hasNextToken()) {
        res.push(lexer.getNextToken())
    }
    expect(res).toEqual(expected)
})
