import {explode} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "../model/expression";
import {GroupExpression} from "../model/group-expression";
import {MatchGroup} from "../model/match/match-group";
import {AssertionExpression, AssertionType} from "../model/assertion-expression";

export default class RegexEngine {
    private readonly _parser: Parser
    private _matchOffset: number = 0
    private _match: string = null
    private _groups: {[key: string]: MatchGroup} = {}

    constructor(parser: Parser = new Parser()) {
        this._parser = parser;
    }

    get groups(): MatchGroup[] {
        return Object.values(this._groups)
    }

    get matched(): string {
        return this._match
    }

    isAtZeroPos = () => {
        return this._matchOffset === 0;
    }

    match = (s: string, p: string): boolean => {
        this._matchOffset = 0;
        this._groups = {}
        this._match = null
        const stringChars = explode(s)

        while(this._matchOffset < stringChars.length) {
            const expressions = this._parser.parse(p)
            const res = this.tryTest(stringChars.slice(this._matchOffset), expressions)
            if (res) {
                this._groups = Object.fromEntries(Object.entries(this._groups).map(([key, value]) => [key, {...value, from: value.from + this._matchOffset, to: value.to + this._matchOffset}]))
                this._match = expressions.flatMap(it => it.currentMatch()).join('')
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
            if (!(nextExpression instanceof AssertionExpression) || nextExpression.type !== AssertionType.LOOKBEHIND) {
                const {match, tokensConsumed, matched} = RegexEngine.tryTestExpression(nextExpression, toTest, cursorPos, this.isAtZeroPos())
                cursorPos += tokensConsumed
                if (match) {
                    if (nextExpression.tracksMatch() && matched.length) {
                        this._groups[expressionIdx] = {match: matched.join(''), from: cursorPos - matched.length, to: cursorPos}
                    }

                    continue
                }
            } else {
                let lookbehindCursorPos = cursorPos
                let lookbehindSuccessful = false
                while(lookbehindCursorPos < toTest.length) {
                    const lookBehindCursorPosFrom = lookbehindCursorPos - nextExpression.minimumLength
                    if (lookBehindCursorPosFrom >= 0) {
                        const sBehindCurrent = toTest.slice(lookBehindCursorPosFrom, lookbehindCursorPos)
                        const {match: lookbehindMatch} = RegexEngine.tryTestExpression(nextExpression, sBehindCurrent, lookBehindCursorPosFrom, this.isAtZeroPos())
                        if (lookbehindMatch) {
                            lookbehindSuccessful = true
                            break
                        }
                        nextExpression.reset()
                    }
                    lookbehindCursorPos += 1
                }
                if (lookbehindSuccessful) {
                    cursorPos = lookbehindCursorPos
                    continue;
                }
                // lookbehind failed
                return false
            }

            // TODO: Is this always correct?
            if (expressionIdx <= 0) {
                return false
            }

            let backtrackIdx = expressionIdx - 1
            let backtrackSuccessful = false
            while(backtrackIdx >= 0) {
                const previousExpression = expressions[backtrackIdx]
                while (!backtrackSuccessful && this.tryBacktrack(previousExpression)) {
                    cursorPos--
                    if (previousExpression instanceof GroupExpression) {
                        this._groups[backtrackIdx] = {match: previousExpression.currentMatch().join(''), from: cursorPos - previousExpression.currentMatch().length, to: cursorPos}
                    }
                    nextExpression.reset()
                    const {match: backtrackMatch, matched: backtrackMatched, tokensConsumed: backtrackTokensConsumed} = RegexEngine.tryTestExpression(nextExpression, toTest, cursorPos, this.isAtZeroPos())
                    if (!backtrackMatch) {
                        continue
                    }
                    cursorPos += backtrackTokensConsumed
                    // backtrack successful
                    if (nextExpression instanceof GroupExpression) {
                        this._groups[backtrackIdx] = {match: backtrackMatched.join(''), from: cursorPos - backtrackMatched.length, to: cursorPos}
                    }
                    backtrackSuccessful = true
                }
                if (backtrackSuccessful) {
                    break
                }
                if (previousExpression.hasNotMatched() && previousExpression.isSuccessful()) {
                    backtrackIdx--
                    continue;
                }
                // backtrack failed
                return false
            }
            if (!backtrackSuccessful) {
                return false
            }
        }

        // Sanity check, should not be necessary (?)
        return expressions.every(it => it.isSuccessful())
    }

    private static tryTestExpression = (expression: Expression, toTest: string[], startIdx: number, isAtZeroPos: boolean) => {
        let idx = startIdx
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            const matchRes = expression.matchNext(nextChar, previous, next, isAtZeroPos)
            if (matchRes) {
                idx += expression.lastMatchCharactersConsumed()
            }
        }
        if (!expression.isSuccessful()) {
            return {match: false, tokensConsumed: 0, matched: []}
        }
        return {match: expression.isSuccessful(), tokensConsumed: idx - startIdx, matched: expression.currentMatch()}
    }

    private tryBacktrack = (expression: Expression) => {
        if (!expression.canBacktrack()) {
            return false
        }
        return expression.backtrack(this.isAtZeroPos())
    }
}
