import {explode} from "../utils/string-utils";
import Parser from "./parser/parser";
import {Expression} from "../model/expression";
import {DefaultGroupExpression} from "../model/default-group-expression";
import {MatchGroup} from "../model/match/match-group";
import {AssertionExpression, AssertionType} from "../model/assertion-expression";
import {AbstractGroupExpression} from "../model/abstract-group-expression";
import {isGroupExpression} from "../model/group-expression";

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
                this._groups = Object.fromEntries(Object.entries(this._groups).map(([key, matches]) => [key, matches.map(value => ({...value, from: value.from + this._matchOffset, to: value.to + this._matchOffset}))]))
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
            const cursorBeforeMatch = cursorPos
            const nextExpression = expressions[expressionIdx]
            if (!(nextExpression instanceof AssertionExpression) || nextExpression.type !== AssertionType.LOOKBEHIND) {
                const {match, tokensConsumed} = this.tryTestExpression([nextExpression, expressionIdx], toTest, cursorPos, this.isAtZeroPos())
                cursorPos += tokensConsumed
                if (match) {
                    continue
                }
            } else {
                let lookbehindCursorPos = cursorPos
                let lookbehindSuccessful = false
                while(lookbehindCursorPos < toTest.length) {
                    const lookBehindCursorPosFrom = lookbehindCursorPos - nextExpression.minimumLength
                    if (lookBehindCursorPosFrom >= 0) {
                        const sBehindCurrent = toTest.slice(lookBehindCursorPosFrom, lookbehindCursorPos)
                        const {match: lookbehindMatch} = this.tryTestExpression([nextExpression, expressionIdx], sBehindCurrent, lookBehindCursorPosFrom, this.isAtZeroPos())
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
                    this._groups[expressionIdx] = nextExpression.matchGroups.map(group => ({match: group.match, from: cursorBeforeMatch + group.from, to: cursorBeforeMatch + group.to}))
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
                    nextExpression.reset()
                    const {match: backtrackMatch, matched: backtrackMatched, tokensConsumed: backtrackTokensConsumed} = this.tryTestExpression([nextExpression, expressionIdx], toTest, cursorPos, this.isAtZeroPos())
                    if (isGroupExpression(previousExpression)) {
                        // TODO: correct end position?
                        this._groups[backtrackIdx] = previousExpression.matchGroups.map(group => ({match: group.match, from: cursorPos - previousExpression.currentMatch().length + group.from, to: cursorPos - previousExpression.currentMatch().length + group.to}))
                    }
                    if (!backtrackMatch) {
                        continue
                    }
                    cursorPos += backtrackTokensConsumed
                    // if (isGroupExpression(nextExpression)) {
                    //     // TODO: correct end position?
                    //     this._groups[expressionIdx] = nextExpression.matchGroups.map(group => ({match: group.match, from: cursorPos - backtrackMatched.length + group.from, to: cursorPos - backtrackMatched.length + group.to}))
                    // }
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

    private tryTestExpression = ([expression, id]: [Expression, number], toTest: string[], startIdx: number, isAtZeroPos: boolean) => {
        let idx = startIdx
        while(expression.hasNext()) {
            const nextChar = idx < toTest.length ? toTest[idx] : null
            const previous = idx > 0 ? toTest[idx - 1] : null
            const next = idx + 1 < toTest.length ? toTest[idx + 1] : null
            const matchRes = expression.matchNext(nextChar, previous, next, isAtZeroPos)
            if (matchRes) {
                const updatedIdx = idx + expression.lastMatchCharactersConsumed()
                if (isGroupExpression(expression)) {
                    this._groups[id] = expression.matchGroups.map(group => ({match: group.match, from: idx + group.from, to: idx + group.to}))
                }
                idx = updatedIdx
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
