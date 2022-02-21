import Parser from "./parser";
import Token from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import Character from "../../model/character";
import GreedyExpression from "../../model/greedy-expression";
import BracketExpression from "../../model/bracket-expression";
import DefaultCharacter from "../../model/default-character";
import WildcardCharacter from "../../model/wildcard-character";
import WordBoundaryCharacter from "../../model/word-boundary-character";
import WordWildcardCharacter from "../../model/word-wildcard-character";
import DigitWildcardCharacter from "../../model/digit-wildcard-character";

test('should return empty expression array for empty string', () => {
    const parser = new Parser()
    const res = parser.parse('')
    expect(res).toEqual([])
})

test('should correctly parse character literal', () => {
    const parser = new Parser()
    const res = parser.parse('my-string')
    const expected = [
        new DefaultCharacter('m'),
        new DefaultCharacter('y'),
        new DefaultCharacter('-'),
        new DefaultCharacter('s'),
        new DefaultCharacter('t'),
        new DefaultCharacter('r'),
        new DefaultCharacter('i'),
        new DefaultCharacter('n'),
        new DefaultCharacter('g'),
    ].map(it => new SimpleExpression(it))
    expect(res).toEqual(expected)
})

test('should correctly parse greedy modifier for single character', () => {
    const parser = new Parser()
    const res = parser.parse('st*')
    const expected = [
        new SimpleExpression(new DefaultCharacter('s')),
        new GreedyExpression(new SimpleExpression(new DefaultCharacter('t')))
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse greedy at least once modifier for single character', () => {
    const parser = new Parser()
    const res = parser.parse('st+')
    const expected = [
        new SimpleExpression(new DefaultCharacter('s')),
        new GreedyExpression(new SimpleExpression(new DefaultCharacter('t')), false)
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse bracket expression', () => {
    const parser = new Parser()
    const res = parser.parse('[abc]')
    const expected = [
        new BracketExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        )
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse multiple bracket expressions', () => {
    const parser = new Parser()
    const res = parser.parse('[abc][zyw]')
    const expected = [
        new BracketExpression(
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('c')),
        ),
        new BracketExpression(
            new SimpleExpression(new DefaultCharacter('z')),
            new SimpleExpression(new DefaultCharacter('y')),
            new SimpleExpression(new DefaultCharacter('w')),
        )
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse wildcard character .', () => {
    const parser = new Parser()
    const res = parser.parse('test.')
    const expected = [
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WildcardCharacter()),
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse word boundary character \b', () => {
    const parser = new Parser()
    const res = parser.parse('\\btest\\b')
    const expected = [
        new SimpleExpression(new WordBoundaryCharacter()),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WordBoundaryCharacter()),
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse word wildcard character \w', () => {
    const parser = new Parser()
    const res = parser.parse('test\\w029')
    const expected = [
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new WordWildcardCharacter()),
        new SimpleExpression(new DefaultCharacter('0')),
        new SimpleExpression(new DefaultCharacter('2')),
        new SimpleExpression(new DefaultCharacter('9')),
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse word wildcard character \d', () => {
    const parser = new Parser()
    const res = parser.parse('test\\d')
    const expected = [
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DefaultCharacter('e')),
        new SimpleExpression(new DefaultCharacter('s')),
        new SimpleExpression(new DefaultCharacter('t')),
        new SimpleExpression(new DigitWildcardCharacter()),
    ]
    expect(res).toEqual(expected)
})
