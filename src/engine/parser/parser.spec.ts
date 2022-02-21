import Parser from "./parser";
import Token from "../../model/token";
import {SimpleExpression} from "../../model/simple-expression";
import Character from "../../model/character";
import GreedyExpression from "../../model/greedy-expression";
import BracketExpression from "../../model/bracket-expression";

test('should return empty expression array for empty string', () => {
    const parser = new Parser()
    const res = parser.parse('')
    expect(res).toEqual([])
})

test('should correctly parse character literal', () => {
    const parser = new Parser()
    const res = parser.parse('my-string')
    const expected = [
        new Character('m'),
        new Character('y'),
        new Character('-'),
        new Character('s'),
        new Character('t'),
        new Character('r'),
        new Character('i'),
        new Character('n'),
        new Character('g'),
    ].map(it => new SimpleExpression(it))
    expect(res).toEqual(expected)
})

test('should correctly parse greedy modifier for single character', () => {
    const parser = new Parser()
    const res = parser.parse('st*')
    const expected = [
        new SimpleExpression(new Character('s')),
        new GreedyExpression(new SimpleExpression(new Character('t')))
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse greedy at least once modifier for single character', () => {
    const parser = new Parser()
    const res = parser.parse('st+')
    const expected = [
        new SimpleExpression(new Character('s')),
        new GreedyExpression(new SimpleExpression(new Character('t')), false)
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse bracket expression', () => {
    const parser = new Parser()
    const res = parser.parse('[abc]')
    const expected = [
        new BracketExpression(
            new SimpleExpression(new Character('a')),
            new SimpleExpression(new Character('b')),
            new SimpleExpression(new Character('c')),
        )
    ]
    expect(res).toEqual(expected)
})

test('should correctly parse multiple bracket expressions', () => {
    const parser = new Parser()
    const res = parser.parse('[abc][zyw]')
    const expected = [
        new BracketExpression(
            new SimpleExpression(new Character('a')),
            new SimpleExpression(new Character('b')),
            new SimpleExpression(new Character('c')),
        ),
        new BracketExpression(
            new SimpleExpression(new Character('z')),
            new SimpleExpression(new Character('y')),
            new SimpleExpression(new Character('w')),
        )
    ]
    expect(res).toEqual(expected)
})
