import {SimpleExpression} from "./simple-expression";
import {explodeToCharacters} from "../utils/string-utils";
import BracketExpression from "./bracket-expression";

test.each([
    {expression: 'test', match: 't', shouldMatch: true},
    {expression: 'test', match: 'x', shouldMatch: false},
])('should match simple expression', ({expression, match, shouldMatch}) => {
    const bracketExpression = new BracketExpression(
        ...explodeToCharacters(expression).map(it => new SimpleExpression(it))
    )
    let idx = 0
    while(bracketExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        bracketExpression.matchNext(match[idx])
        idx++
    }
    expect(bracketExpression.isSuccessful()).toEqual(shouldMatch)
})

test.each([
    {expression: 'test', match: 't', shouldMatch: false},
    {expression: 'test', match: 'x', shouldMatch: true},
])('should match simple expression for negated brackets: %s', ({expression, match, shouldMatch}) => {
    const bracketExpression = BracketExpression.negated(
        ...explodeToCharacters(expression).map(it => new SimpleExpression(it))
    )
    let idx = 0
    while(bracketExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        bracketExpression.matchNext(match[idx])
        idx++
    }
    expect(bracketExpression.isSuccessful()).toEqual(shouldMatch)
})
