import {SimpleExpression} from "./simple-expression";
import {explodeToCharacters} from "../utils/string-utils";
import GreedyExpression from "./greedy-expression";

test.each([
    {expression: 'test', match: 'test', shouldMatch: true},
    {expression: 'test', match: 'testtest', shouldMatch: true},
    {expression: 'test', match: '', shouldMatch: false},
    {expression: 'test', match: 'mambojambo', shouldMatch: true},
    {expression: '', match: 'test', shouldMatch: true},
])('should greedily match expression: %s', ({expression, match, shouldMatch}) => {
    const greedyExpression = new GreedyExpression(new SimpleExpression(...explodeToCharacters(expression)))
    let idx = 0
    while(greedyExpression.hasNext()) {
        if (idx >= match.length) {
            break
        }
        greedyExpression.matchNext(match[idx])
        idx++
    }
    expect(greedyExpression.isSuccessful()).toEqual(shouldMatch)
})

test.each([
    {expression: 'test', match: 'test', shouldMatch: true},
    {expression: 'test', match: 'testtest', shouldMatch: true},
    {expression: 'test', match: '', shouldMatch: false},
    {expression: 'test', match: 'mambojambo', shouldMatch: false},
    {expression: '', match: 'test', shouldMatch: true},
])('should greedily match expression when allowNoMatch=true: %s', ({expression, match, shouldMatch}) => {
    const greedyExpression = new GreedyExpression(new SimpleExpression(...explodeToCharacters(expression)), false)
    let idx = 0
    while(greedyExpression.hasNext()) {
        if (idx >= match.length) {
            break
        }
        greedyExpression.matchNext(match[idx])
        idx++
    }
    expect(greedyExpression.isSuccessful()).toEqual(shouldMatch)
})
