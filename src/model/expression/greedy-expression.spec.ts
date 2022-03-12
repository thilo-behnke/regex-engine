import {SimpleExpression} from "./simple-expression";
import {explodeIndexed, explodeToCharacters} from "@utils/string-utils";
import GreedyExpression from "./greedy-expression";
import DefaultCharacter from "../character/default-character";

test.each([
    {expression: 't', match: 'test', shouldMatch: true},
    {expression: 't', match: 'testtest', shouldMatch: true},
    {expression: 't', match: '', shouldMatch: false},
    {expression: 't', match: 'mambojambo', shouldMatch: false},
    {expression: '', match: 'test', shouldMatch: false},
])('should greedily match expression: %s', ({expression, match, shouldMatch}) => {
    const expressions = explodeToCharacters(expression).map(it => new SimpleExpression(it))
    const greedyExpression = new GreedyExpression(expression.length ? expressions[0] : new SimpleExpression(new DefaultCharacter('')), false)
    let idx = 0
    const tokens = explodeIndexed(match)
    while(greedyExpression.hasNext()) {
        if (idx >= match.length) {
            break
        }
        greedyExpression.matchNext(tokens[idx], null, null, tokens)
        idx++
    }
    expect(greedyExpression.isSuccessful()).toEqual(shouldMatch)
})

test.each([
    {expression: 't', match: 'test', shouldMatch: true},
    {expression: 't', match: 'testtest', shouldMatch: true},
    {expression: 't', match: '', shouldMatch: false},
    {expression: 't', match: 'mambojambo', shouldMatch: true},
    {expression: '', match: 'test', shouldMatch: true},
])('should greedily match expression when allowNoMatch=true: %s', ({expression, match, shouldMatch}) => {
    const expressions = explodeToCharacters(expression).map(it => new SimpleExpression(it))
    const greedyExpression = new GreedyExpression(expression.length ? expressions[0] : new SimpleExpression(new DefaultCharacter('')), true)
    let idx = 0
    const tokens = explodeIndexed(match)
    while(greedyExpression.hasNext()) {
        if (idx >= match.length) {
            break
        }
        greedyExpression.matchNext(tokens[idx], null, null, tokens)
        idx++
    }
    expect(greedyExpression.isSuccessful()).toEqual(shouldMatch)
})
