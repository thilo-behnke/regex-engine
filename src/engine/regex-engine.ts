import {explodeIndexed, IndexedToken} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "../model/expression";
import {isGroupExpression} from "../model/group-expression";
import {MatchGroup} from "../model/match/match-group";
import {AssertionExpression, AssertionType} from "../model/assertion-expression";

export default class RegexEngine {
    private readonly _parser: Parser
    private _matchOffset: number = 0
    private _match: string = null
    private _groups: {[key: string]: MatchGroup[]} = {}

    constructor(parser: Parser = new Parser()) {
        this._parser = parser;
    }

    get groups(): MatchGroup[] {
        return Object.values(this._groups).flat()
    }

    get matched(): string {
        return this._match
    }

    match = (s: string, p: string): boolean => {
        this._matchOffset = 0;
        this._groups = {}
        this._match = null
        const tokens = explodeIndexed(s)

        while(this._matchOffset < tokens.length) {
            const expressions = this._parser.parse(p)
            const res = this.tryTest(tokens.slice(this._matchOffset), expressions)
            if (res) {
                this._match = expressions.flatMap(it => it.currentMatch().map(it => it.value)).join('')
                return true
            }
            this._matchOffset++;
        }

        return false
    }

    private tryTest = (toTest: IndexedToken[], expressions: Expression[]): boolean => {
        let cursorPos = 0
        for(let expressionIdx = 0; expressionIdx < expressions.length; expressionIdx++) {
            const nextExpression = expressions[expressionIdx]
            if (!(nextExpression instanceof AssertionExpression) || nextExpression.type !== AssertionType.LOOKBEHIND) {
                const {match, tokensConsumed, matched} = RegexEngine.tryTestExpression(nextExpression, toTest, cursorPos)
                cursorPos += tokensConsumed
                if (match) {
                    if (isGroupExpression(nextExpression)) {
                        this._groups[expressionIdx] = nextExpression.matchGroups
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
                        const {match: lookbehindMatch} = RegexEngine.tryTestExpression(nextExpression, sBehindCurrent, lookBehindCursorPosFrom)
                        if (lookbehindMatch) {
                            lookbehindSuccessful = true
                            break
                        }
                        nextExpression.reset()
                    }
                    lookbehindCursorPos += 1
                }
                if (lookbehindSuccessful) {
                    this._groups[expressionIdx] = nextExpression.matchGroups
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
                    if (isGroupExpression(previousExpression)) {
                        this._groups[backtrackIdx] = previousExpression.matchGroups
                    }
                    nextExpression.reset()
                    const {match: backtrackMatch, matched: backtrackMatched, tokensConsumed: backtrackTokensConsumed} = RegexEngine.tryTestExpression(nextExpression, toTest, cursorPos)
                    if (!backtrackMatch) {
                        continue
                    }
                    cursorPos += backtrackTokensConsumed
                    // backtrack successful
                    if (isGroupExpression(nextExpression)) {
                        this._groups[backtrackIdx] = nextExpression.matchGroups
                    }
                    backtrackSuccessful = true
                }
                if (backtrackSuccessful) {
                    break
                }
                if (previousExpression.isInitial() && previousExpression.isSuccessful()) {
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

    private static tryTestExpression = (expression: Expression, toTest: IndexedToken[], startIdx: number) => {
        let idx = startIdx
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            const matchRes = expression.matchNext(nextChar, previous, next)
            if (matchRes) {
                idx += expression.lastMatchCharactersConsumed()
            }
        }
        if (!expression.isSuccessful()) {
            return {match: false, tokensConsumed: 0, matched: []}
        }
        return {match: expression.isSuccessful(), tokensConsumed: idx - startIdx, matched: expression.currentMatch().map(it => it.value)}
    }

    private tryBacktrack = (expression: Expression) => {
        if (!expression.canBacktrack()) {
            return false
        }
        return expression.backtrack()
    }
}
