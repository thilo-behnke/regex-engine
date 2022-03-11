import Parser from "./parser";
import {SimpleExpression} from "../../model/simple-expression";
import GreedyExpression from "../../model/greedy-expression";
import SquareBracketExpression from "../../model/square-bracket-expression";
import DefaultCharacter from "../../model/default-character";
import WildcardCharacter from "../../model/wildcard-character";
import WordBoundaryCharacter from "../../model/word-boundary-character";
import WordWildcardCharacter from "../../model/word-wildcard-character";
import DigitWildcardCharacter from "../../model/digit-wildcard-character";
import AnchorStartCharacter from "../../model/anchor-start-character";
import AnchorEndCharacter from "../../model/anchor-end-character";
import {WhitespaceCharacter} from "../../model/whitespace-character";
import {GreedyGroupExpression} from "../../model/greedy-group-expression";
import {AssertionExpression} from "../../model/assertion-expression";
import {DefaultGroupExpression} from "../../model/default-group-expression";
import {OptionalExpression} from "../../model/optional-expression";
import {OptionalGroupExpression} from "../../model/optional-group-expression";

test('should return empty group expression for empty string', () => {
    const parser = new Parser()
    const res = parser.parse('')
    expect(res).toEqual(DefaultGroupExpression.nonCapturing())
})

test('should correctly parse character literal', () => {
    const parser = new Parser()
    const res = parser.parse('my-string')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new DefaultCharacter('m'),
        new DefaultCharacter('y'),
        new DefaultCharacter('-'),
        new DefaultCharacter('s'),
        new DefaultCharacter('t'),
        new DefaultCharacter('r'),
        new DefaultCharacter('i'),
        new DefaultCharacter('n'),
        new DefaultCharacter('g'),
    ].map(it => new SimpleExpression(it)))
    expect(res).toEqual(expected)
})

test('should correctly parse greedy modifier for single character', () => {
    const parser = new Parser()
    const res = parser.parse('st*')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('s')),
        new GreedyExpression(new SimpleExpression(new DefaultCharacter('t')))
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse greedy at least once modifier for single character', () => {
    const parser = new Parser()
    const res = parser.parse('st+')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('s')),
        new GreedyExpression(new SimpleExpression(new DefaultCharacter('t')), false)
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse bracket expression', () => {
    const parser = new Parser()
    const res = parser.parse('[abc]')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SquareBracketExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        )
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse greedy bracket expression', () => {
    const parser = new Parser()
    const res = parser.parse('[abc]+')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new GreedyExpression(
            new SquareBracketExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
                new SimpleExpression(new DefaultCharacter('c')),
            ),
            false
        )
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse multiple bracket expressions', () => {
    const parser = new Parser()
    const res = parser.parse('[abc][zyw]')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SquareBracketExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        ),
        new SquareBracketExpression(
            new SimpleExpression(new DefaultCharacter('z')),
            new SimpleExpression(new DefaultCharacter('y')),
            new SimpleExpression(new DefaultCharacter('w')),
        )
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse bracket with character range', () => {
    const parser = new Parser()
    const res = parser.parse('[a-c]')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SquareBracketExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        ),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse bracket with number range', () => {
    const parser = new Parser()
    const res = parser.parse('[2-5]')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SquareBracketExpression(
            new SimpleExpression(new DefaultCharacter('2')),
            new SimpleExpression(new DefaultCharacter('3')),
            new SimpleExpression(new DefaultCharacter('4')),
            new SimpleExpression(new DefaultCharacter('5')),
        ),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse bracket with capitalized char range', () => {
    const parser = new Parser()
    const res = parser.parse('[a-cA-C]')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SquareBracketExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
            new SimpleExpression(new DefaultCharacter('A')),
            new SimpleExpression(new DefaultCharacter('B')),
            new SimpleExpression(new DefaultCharacter('C')),
        ),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse wildcard character .', () => {
    const parser = new Parser()
    const res = parser.parse('test.')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WildcardCharacter()),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse word boundary character \b', () => {
    const parser = new Parser()
    const res = parser.parse('\\btest\\b')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new WordBoundaryCharacter()),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WordBoundaryCharacter()),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse word wildcard character \w', () => {
    const parser = new Parser()
    const res = parser.parse('test\\w029')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WordWildcardCharacter()),
        new SimpleExpression(new DefaultCharacter('0')),
        new SimpleExpression(new DefaultCharacter('2')),
        new SimpleExpression(new DefaultCharacter('9')),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse word wildcard character \d', () => {
    const parser = new Parser()
    const res = parser.parse('test\\d')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DigitWildcardCharacter()),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse start anchor', () => {
    const parser = new Parser()
    const res = parser.parse('^test-word')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new AnchorStartCharacter()),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('-')),
        new SimpleExpression(new DefaultCharacter('w')),
        new SimpleExpression(new DefaultCharacter('o')),
        new SimpleExpression(new DefaultCharacter('r')),
        new SimpleExpression(new DefaultCharacter('d')),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse end anchor', () => {
    const parser = new Parser()
    const res = parser.parse('test-word$')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('-')),
        new SimpleExpression(new DefaultCharacter('w')),
        new SimpleExpression(new DefaultCharacter('o')),
        new SimpleExpression(new DefaultCharacter('r')),
        new SimpleExpression(new DefaultCharacter('d')),
        new SimpleExpression(new AnchorEndCharacter()),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse whitespace', () => {
    const parser = new Parser()
    const res = parser.parse('test\\sword$')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WhitespaceCharacter()),
        new SimpleExpression(new DefaultCharacter('w')),
        new SimpleExpression(new DefaultCharacter('o')),
        new SimpleExpression(new DefaultCharacter('r')),
        new SimpleExpression(new DefaultCharacter('d')),
        new SimpleExpression(new AnchorEndCharacter()),
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse not modifier in beginning of bracket (^)', () => {
    const parser = new Parser()
    const res = parser.parse('[^abc]')
    const expected = DefaultGroupExpression.nonCapturing(...[
        SquareBracketExpression.negated(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        )
    ])
    expect(res).toEqual(expected)
})

test('should correctly parse group', () => {
    const parser = new Parser()
    const res = parser.parse('(abc)')
    const expected = DefaultGroupExpression.nonCapturing(...[
        new DefaultGroupExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        )
    ])
    expect(res).toEqual(expected)
})

test.each([
    {
        expression: "(abc)de",
        expected: DefaultGroupExpression.nonCapturing(...[
            new DefaultGroupExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
                new SimpleExpression(new DefaultCharacter('c')),
            ),
            new SimpleExpression(new DefaultCharacter('d')),
            new SimpleExpression(new DefaultCharacter('e')),
        ])
    },
    {
        expression: "(abc)(def)+",
        expected: DefaultGroupExpression.nonCapturing(...[
            new DefaultGroupExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
                new SimpleExpression(new DefaultCharacter('c')),
            ),
            new GreedyGroupExpression(
                new DefaultGroupExpression(
                    new SimpleExpression(new DefaultCharacter('d')),
                    new SimpleExpression(new DefaultCharacter('e')),
                    new SimpleExpression(new DefaultCharacter('f')),
                ),
                false
            )
        ])
    }
]) ('should correctly parse group: %s', ({expression, expected}) => {
    const res = new Parser().parse(expression)
    expect(res).toEqual(expected)
})

test.each([
    {
        expression: "(?:abc)de",
        expected: DefaultGroupExpression.nonCapturing(...[
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
                new SimpleExpression(new DefaultCharacter('c')),
            ),
            new SimpleExpression(new DefaultCharacter('d')),
            new SimpleExpression(new DefaultCharacter('e')),
        ])
    },
    {
        expression: "(?:abc)(def)+",
        expected: DefaultGroupExpression.nonCapturing(...[
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
                new SimpleExpression(new DefaultCharacter('c')),
            ),
            new GreedyGroupExpression(
                new DefaultGroupExpression(
                    new SimpleExpression(new DefaultCharacter('d')),
                    new SimpleExpression(new DefaultCharacter('e')),
                    new SimpleExpression(new DefaultCharacter('f')),
                ),
                false
            )
        ])
    }
]) ('should correctly parse non matching group: %s', ({expression, expected}) => {
    const res = new Parser().parse(expression)
    expect(res).toEqual(expected)
})

test.each([
    {
        expression: "a(?=b)",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new DefaultCharacter('a')),
            AssertionExpression.positiveLookahead(
                new SimpleExpression(new DefaultCharacter('b'))
            ),
        ])
    },
    {
        expression: "de(?=a)",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new DefaultCharacter('d')),
            new SimpleExpression(new DefaultCharacter('e')),
            AssertionExpression.positiveLookahead(
                new SimpleExpression(new DefaultCharacter('a'))
            ),
        ])
    },
    {
        expression: "de(?=ba*)",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new DefaultCharacter('d')),
            new SimpleExpression(new DefaultCharacter('e')),
            AssertionExpression.positiveLookahead(
                new SimpleExpression(new DefaultCharacter('b')),
                new GreedyExpression(new SimpleExpression(new DefaultCharacter('a')))
            ),
        ])
    },
    {
        expression: "de(?!ba*)",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new DefaultCharacter('d')),
            new SimpleExpression(new DefaultCharacter('e')),
            AssertionExpression.negativeLookahead(
                new SimpleExpression(new DefaultCharacter('b')),
                new GreedyExpression(new SimpleExpression(new DefaultCharacter('a')))
            ),
        ])
    }
]) ('should correctly parse look ahead: %s', ({expression, expected}) => {
    const res = new Parser().parse(expression)
    expect(res).toEqual(expected)
})

test.each([
    {
        expression: "(?<=a)b",
        expected: DefaultGroupExpression.nonCapturing(...[
            AssertionExpression.positiveLookbehind(
                new SimpleExpression(new DefaultCharacter('a'))
            ),
            new SimpleExpression(new DefaultCharacter('b')),
        ])
    },
    {
        expression: "(?<!de)a",
        expected: DefaultGroupExpression.nonCapturing(...[
            AssertionExpression.negativeLookbehind(
                new SimpleExpression(new DefaultCharacter('d')),
                new SimpleExpression(new DefaultCharacter('e'))
            ),
            new SimpleExpression(new DefaultCharacter('a')),
        ])
    },
]) ('should correctly parse look behind: %s', ({expression, expected}) => {
    const res = new Parser().parse(expression)
    expect(res).toEqual(expected)
})

test.each([
    {
        expression: "(?<=a*)b"
    }
]) ('should not allow modifier in look behind: %s', ({expression}) => {
    expect(() => new Parser().parse(expression)).toThrow(Error)
})

test.each([
    {
        expression: "abc?",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new OptionalExpression(
                new SimpleExpression(new DefaultCharacter('c'))
            )
        ])
    },
    {
        expression: "ab(c)?",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new OptionalGroupExpression(
                new DefaultGroupExpression(new SimpleExpression(new DefaultCharacter('c')))
            )
        ])
    },
    {
        expression: "^a(b(c)?)$",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SimpleExpression(new AnchorStartCharacter()),
            new SimpleExpression(new DefaultCharacter('a')),
            new DefaultGroupExpression(
                new SimpleExpression(new DefaultCharacter('b')),
                new OptionalGroupExpression(
                    new DefaultGroupExpression(new SimpleExpression(new DefaultCharacter('c')))
                )
            ),
            new SimpleExpression(new AnchorEndCharacter())
        ])
    },
    {
        expression: "[ab?]",
        expected: DefaultGroupExpression.nonCapturing(...[
            new SquareBracketExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
                new SimpleExpression(new DefaultCharacter('?'))
            ),
        ])
    }
]) ('should correctly parse optional expression: %s', ({expression, expected}) => {
    const res = new Parser().parse(expression)
    expect(res).toEqual(expected)
})
