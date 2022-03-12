import {SimpleExpression} from "./simple-expression";
import DefaultCharacter from "./character/default-character";
import {DefaultGroupExpression} from "./default-group-expression";
import {explodeIndexed} from "@utils/string-utils";
import AlternativeExpression from "./alternative-expression";


test.each([
    {
        // a|b
        expressions: [
            new SimpleExpression(new DefaultCharacter('a')),
            new SimpleExpression(new DefaultCharacter('b'))
        ],
        toTest: 'a',
        expectedRes: true,
        expectedMatch: ['a']
    },
    {
        // ab|a
        expressions: [
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b'))
            ),
            new SimpleExpression(new DefaultCharacter('a'))
        ],
        toTest: 'ab',
        expectedRes: true,
        expectedMatch: ['a', 'b']
    },
    {
        // ab|a
        expressions: [
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('a')),
                new SimpleExpression(new DefaultCharacter('b'))
            ),
            new SimpleExpression(new DefaultCharacter('a'))
        ],
        toTest: 'bbc',
        expectedRes: false,
        expectedMatch: []
    },
    {
        // test|test2
        expressions: [
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('e')),
                new SimpleExpression(new DefaultCharacter('s')),
                new SimpleExpression(new DefaultCharacter('t'))
            ),
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('e')),
                new SimpleExpression(new DefaultCharacter('s')),
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('2'))
            ),
        ],
        toTest: 'test2',
        expectedRes: true,
        expectedMatch: ['t', 'e', 's', 't']
    },
    {
        // test2|test
        expressions: [
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('e')),
                new SimpleExpression(new DefaultCharacter('s')),
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('2'))
            ),
            DefaultGroupExpression.nonCapturing(
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('e')),
                new SimpleExpression(new DefaultCharacter('s')),
                new SimpleExpression(new DefaultCharacter('t')),
                new SimpleExpression(new DefaultCharacter('2'))
            ),
        ],
        toTest: 'test2',
        expectedRes: true,
        expectedMatch: ['t', 'e', 's', 't', '2']
    }
])('should correctly match alternative expression: %s', ({expressions, toTest, expectedRes, expectedMatch}) => {
    const expression = new AlternativeExpression(...expressions)
    let stringIdx = 0
    const tokens = explodeIndexed(toTest)
    while (expression.hasNext()) {
        const matchRes = expression.matchNext(tokens[stringIdx], null, null, tokens)
        if (!matchRes) {
            break
        }
        stringIdx++
    }
    expect(expression.isSuccessful()).toEqual(expectedRes)
    expect(expression.currentMatch().map(it => it.value)).toEqual(expectedMatch)
})
