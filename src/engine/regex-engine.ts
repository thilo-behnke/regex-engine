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
    private _groups: MatchGroup[] = []

    constructor(parser: Parser = new Parser()) {
        this._parser = parser;
    }

    get groups(): MatchGroup[] {
        return this._groups
    }

    get matched(): string {
        return this._match
    }

    match = (s: string, p: string): boolean => {
        this._matchOffset = 0;
        this._groups = []
        this._match = null
        const tokens = explodeIndexed(s)

        while(this._matchOffset < tokens.length) {
            const expression = this._parser.parse(p)
            const res = RegexEngine.tryTestExpression(expression, tokens, this._matchOffset)
            let matchSuccessful = res.match
            let tokensConsumed = res.tokensConsumed
            while (!matchSuccessful && expression.canBacktrack()) {
                const backtrackRes = expression.backtrack(tokens, tokensConsumed)
                if (!backtrackRes) {
                    break
                }
                const  unmatchedTokenOffset = this._matchOffset + tokensConsumed
                if ( unmatchedTokenOffset >= tokens.length) {
                    matchSuccessful = true
                    break
                }
                const res = RegexEngine.tryTestExpression(expression, tokens, unmatchedTokenOffset)
                matchSuccessful = res.match
                tokensConsumed = res.tokensConsumed
            }
            if (matchSuccessful) {
                this._match = expression.currentMatch().map(it => it.value).join('')
                if (isGroupExpression(expression)) {
                    this._groups = expression.matchGroups
                }
                return true
            }
            this._matchOffset++;
        }

        return false
    }

    // private tryTest = (toTest: IndexedToken[], expressions: Expression[]): boolean => {
    //     let cursorPos = 0
    //     for(let expressionIdx = 0; expressionIdx < expressions.length; expressionIdx++) {
    //         const nextExpression = expressions[expressionIdx]
    //         if (!(nextExpression instanceof AssertionExpression) || nextExpression.type !== AssertionType.LOOKBEHIND) {
    //             const {match, tokensConsumed} = RegexEngine.tryTestExpression(nextExpression, toTest, cursorPos)
    //             cursorPos += tokensConsumed
    //             if (match) {
    //                 if (isGroupExpression(nextExpression)) {
    //                     this._groups[expressionIdx] = nextExpression.matchGroups
    //                 }
    //
    //                 continue
    //             }
    //         } else {
    //             let lookbehindCursorPos = cursorPos
    //             let lookbehindSuccessful = false
    //             while(lookbehindCursorPos < toTest.length) {
    //                 const lookBehindCursorPosFrom = lookbehindCursorPos - nextExpression.minimumLength
    //                 if (lookBehindCursorPosFrom >= 0) {
    //                     const sBehindCurrent = toTest.slice(lookBehindCursorPosFrom, lookbehindCursorPos)
    //                     const {match: lookbehindMatch} = RegexEngine.tryTestExpression(nextExpression, sBehindCurrent, lookBehindCursorPosFrom)
    //                     if (lookbehindMatch) {
    //                         lookbehindSuccessful = true
    //                         break
    //                     }
    //                     nextExpression.reset()
    //                 }
    //                 lookbehindCursorPos += 1
    //             }
    //             if (lookbehindSuccessful) {
    //                 this._groups[expressionIdx] = nextExpression.matchGroups
    //                 cursorPos = lookbehindCursorPos
    //                 continue;
    //             }
    //             // lookbehind failed
    //             return false
    //         }
    //
    //         const backtrackSuccessful = nextExpression.backtrack()
    //         if (!backtrackSuccessful) {
    //             return false
    //         }
    //     }
    //
    //     // Sanity check, should not be necessary (?)
    //     return expressions.every(it => it.isSuccessful())
    // }

    private static tryTestExpression = (expression: Expression, toTest: IndexedToken[], offset: number) => {
        let idx = offset
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            const matchRes = expression.matchNext(nextChar, previous, next, toTest, idx)
            idx += matchRes.consumed
            if (!matchRes.matched) {
                break
            }
        }
        return {match: expression.isSuccessful(), tokensConsumed: idx - offset, matched: expression.currentMatch().map(it => it.value)}
    }
}
