import {DefaultGroupExpression} from "./default-group-expression";
import {SimpleExpression} from "./simple-expression";
import DefaultCharacter from "./default-character";
import {explode, explodeToCharacters} from "../utils/string-utils";
import GreedyExpression from "./greedy-expression";
import SquareBracketExpression from "./square-bracket-expression";

test.each([
    {
        expressions: [
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b'))
        ],
        toTest: 'ab',
        expectedRes: true,
        expectedMatch: ['a', 'b']
    },
    {
        expressions: [
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b'))
        ],
        toTest: 'aa',
        expectedRes: false,
        expectedMatch: []
    },
    {
        expressions: [

            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b'))
        ],
        toTest: 'a',
        expectedRes: false,
        expectedMatch: []
    },
    {
        expressions: [
            new SimpleExpression(new DefaultCharacter('a')),
            new GreedyExpression(new SimpleExpression(new DefaultCharacter('b')))
        ],
        toTest: 'abbbbbc',
        expectedRes: true,
        expectedMatch: ['a', 'b', 'b', 'b', 'b', 'b']
    },
    {
        expressions: [
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b')),
            new SimpleExpression(new DefaultCharacter('d')),
            new SimpleExpression(new DefaultCharacter('e')),
        ],
        toTest: 'abce',
        expectedRes: false,
        expectedMatch: []
    },
    {
        expressions: [
            new SquareBracketExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
            ),
            new GreedyExpression(
                new SimpleExpression(new DefaultCharacter('d'))
            )
        ],
        toTest: 'abdd',
        expectedRes: true,
        expectedMatch: ['a']
    },
    {
        expressions: [
            new SquareBracketExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
            ),
            new GreedyExpression(
                new SimpleExpression(new DefaultCharacter('d')),
                false
            )
        ],
        toTest: 'abdd',
        expectedRes: false,
        expectedMatch: []
    },
    {
        expressions: [
            new SquareBracketExpression(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b')),
            ),
            new GreedyExpression(
                new SimpleExpression(new DefaultCharacter('d'))
            )
        ],
        toTest: 'addd',
        expectedRes: true,
        expectedMatch: ['a', 'd', 'd', 'd']
    }
])('should correctly match group of characters: %s', ({expressions, toTest, expectedRes, expectedMatch}) => {
    const expression = new DefaultGroupExpression(...expressions)
    let res = false
    let stringIdx = 0
    while(expression.hasNext()) {
        expression.matchNext(toTest[stringIdx])
        res = expression.isSuccessful()
        stringIdx++
    }
    expect(res).toEqual(expectedRes)
    expect(expression.currentMatch()).toEqual(expectedMatch)
})