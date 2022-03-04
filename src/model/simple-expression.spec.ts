import {SimpleExpression} from "./simple-expression";
import {explodeIndexed, explodeToCharacters} from "../utils/string-utils";

test.each([
    {expression: 'test', match: 'test', shouldMatch: true},
    {expression: 'test', match: 'test2', shouldMatch: true},
    {expression: 'test2', match: 'test', shouldMatch: false},
    {expression: '[test2]', match: '[test2]abcdef', shouldMatch: true},
    {expression: 'test', match: '', shouldMatch: false},
    {expression: '', match: '', shouldMatch: true},
    {expression: '', match: 'test', shouldMatch: true},
    {expression: 'test.', match: 'testing', shouldMatch: true},
    {expression: 'test.ng', match: 'testing', shouldMatch: true},
    {expression: '\\btest\\b', match: 'test', shouldMatch: true},
])('should match simple expression: %s', ({expression, match, shouldMatch}) => {
    const simpleExpression = new SimpleExpression(...explodeToCharacters(expression))
    let idx = 0
    const tokens = explodeIndexed(match)
    while(simpleExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        simpleExpression.matchNext(tokens[idx], idx > 0 ? tokens[idx - 1] : null, idx + 1 < tokens.length ? tokens[idx + 1] : null)
        idx += simpleExpression.lastMatchCharactersConsumed()
    }
    expect(simpleExpression.isSuccessful()).toEqual(shouldMatch)
})
