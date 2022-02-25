import {explode} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "../model/expression";

export default class RegexEngine {
    private readonly _parser: Parser
    private _matchOffset: number = 0

    constructor(parser: Parser = new Parser()) {
        this._parser = parser;
    }

    isAtZeroPos = () => {
        return this._matchOffset === 0;
    }

    test = (s: string, p: string): boolean => {
        this._matchOffset = 0;
        const stringChars = explode(s)

        while(this._matchOffset < stringChars.length) {
            const expressions = this._parser.parse(p)
            const res = this.tryTest(stringChars.slice(this._matchOffset), expressions)
            if (res) {
                return true
            }
            this._matchOffset++;
        }

        return false
    }

    private tryTest = (toTest: string[], expressions: Expression[]): boolean => {
        let cursorPos = 0
        for(let expressionIdx = 0; expressionIdx < expressions.length; expressionIdx++) {
            const nextExpression = expressions[expressionIdx]
            const {match, tokensConsumed} = this.tryTestExpression(nextExpression, toTest, cursorPos)
            cursorPos += tokensConsumed

            if (match) {
                continue
            }

            if (expressionIdx <= 0) {
                return false
            }

            let backtrackIdx = expressionIdx - 1
            cursorPos--
            while(backtrackIdx >= 0) {
                const previousExpression = expressions[backtrackIdx]
                while (this.tryBacktrack(previousExpression)) {
                    cursorPos--
                    nextExpression.reset()
                    if (!this.tryTestExpression(nextExpression, toTest, cursorPos).match) {
                        continue
                    }
                    // backtrack successful
                    return true
                }
                if (previousExpression.hasNotMatched() && previousExpression.isSuccessful()) {
                    backtrackIdx--
                    continue;
                }
                // backtrack failed
                return false
            }
            return false
        }

        // Sanity check, should not be necessary (?)
        return expressions.every(it => it.isSuccessful)
    }

    private tryTestExpression = (expression: Expression, toTest: string[], startIdx: number) => {
        let idx = startIdx
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            expression.matchNext(nextChar, previous, next, this.isAtZeroPos())
            idx += expression.lastMatchCharactersConsumed()
            if (!expression.isSuccessful) {
                return {match: false, tokensConsumed: 0}
            }
        }
        return {match: expression.isSuccessful(), tokensConsumed: idx - startIdx}
    }

    private tryBacktrack = (expression: Expression) => {
        if (!expression.canBacktrack()) {
            return false
        }
        return expression.backtrack()
    }
}
