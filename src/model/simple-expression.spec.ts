import {SimpleExpression} from "./simple-expression";
import {explodeToCharacters} from "../utils/string-utils";

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
    {expression: '\\btest\\b', match: ' test ', shouldMatch: true},
])('should match simple expression: %s', ({expression, match, shouldMatch}) => {
    const simpleExpression = new SimpleExpression(...explodeToCharacters(expression))
    let idx = 0
    while(simpleExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        simpleExpression.matchNext(match[idx], idx > 0 ? match[idx - 1] : null, idx + 1 < match.length ? match[idx + 1] : null)
        idx++
    }
    expect(simpleExpression.isSuccessful()).toEqual(shouldMatch)
})
