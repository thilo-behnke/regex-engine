import {SimpleExpression} from "./simple-expression";
import {explodeIndexed, explodeToCharacters} from "../utils/string-utils";
import SquareBracketExpression from "./square-bracket-expression";

test.each([
    {expression: 'test', match: 't', shouldMatch: true},
    {expression: 'test', match: 'x', shouldMatch: false},
])('should match simple expression', ({expression, match, shouldMatch}) => {
    const bracketExpression = new SquareBracketExpression(
        ...explodeToCharacters(expression).map(it => new SimpleExpression(it))
    )
    let idx = 0
    const tokens = explodeIndexed(match)
    while(bracketExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        bracketExpression.matchNext(tokens[idx])
        idx++
    }
    expect(bracketExpression.isSuccessful()).toEqual(shouldMatch)
})

test.each([
    {expression: 'test', match: 't', shouldMatch: false},
    {expression: 'test', match: 'x', shouldMatch: true},
])('should match simple expression for negated brackets: %s', ({expression, match, shouldMatch}) => {
    const bracketExpression = SquareBracketExpression.negated(
        ...explodeToCharacters(expression).map(it => new SimpleExpression(it))
    )
    let idx = 0
    const tokens = explodeIndexed(match)
    while(bracketExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        bracketExpression.matchNext(tokens[idx], null, null)
        idx++
    }
    expect(bracketExpression.isSuccessful()).toEqual(shouldMatch)
})
