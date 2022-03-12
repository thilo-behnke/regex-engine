import {SimpleExpression} from "./simple-expression";
import {explodeIndexed, explodeToCharacters} from "@utils/string-utils";

test.each([
    {expression: 'test', match: 'test', shouldMatch: true, expectedMatch: 'test'},
    {expression: 'test', match: 'test2', shouldMatch: true, expectedMatch: 'test'},
    {expression: 'test2', match: 'test', shouldMatch: false, expectedMatch: 'test'},
    {expression: '[test2]', match: '[test2]abcdef', shouldMatch: true, expectedMatch: '[test2]'},
    {expression: 'test', match: '', shouldMatch: false, expectedMatch: ''},
    {expression: '', match: '', shouldMatch: true, expectedMatch: ''},
    {expression: '', match: 'test', shouldMatch: true, expectedMatch: ''},
    {expression: 'test.', match: 'testing', shouldMatch: true, expectedMatch: 'testi'},
    {expression: 'test.ng', match: 'testing', shouldMatch: true, expectedMatch: 'testing'},
    {expression: '\\btest\\b', match: 'test', shouldMatch: true, expectedMatch: 'test'},
])('should match simple expression: %s', ({expression, match, shouldMatch, expectedMatch}) => {
    const simpleExpression = new SimpleExpression(...explodeToCharacters(expression))
    let idx = 0
    const tokens = explodeIndexed(match)
    while(simpleExpression.hasNext()) {
        if (idx > match.length) {
            break
        }
        const matchRes = simpleExpression.matchNext(tokens[idx], idx > 0 ? tokens[idx - 1] : null, idx + 1 < tokens.length ? tokens[idx + 1] : null, tokens)
        if (!matchRes) {
            break
        }
        idx += matchRes.consumed
    }
    expect(simpleExpression.isSuccessful()).toEqual(shouldMatch)
    expect(simpleExpression.currentMatch().map(it => it.value).join('')).toEqual(expectedMatch)
})
