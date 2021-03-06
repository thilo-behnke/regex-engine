import {Expression} from "./expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "../match/match-group";
import {IndexedToken} from "@utils/string-utils";
import {matchFailed, MatchIteration} from "./match-iteration";
import {last} from "@utils/array-utils";
import orderBy = require("lodash.orderby");
import {BacktrackIteration, backtrackFailed, successfulBacktrack} from "./backtrack-iteration";

export abstract class AbstractGroupExpression implements Expression, GroupExpression {
    private _idx: number = 0
    private _currentMatch: Array<[number, IndexedToken]> = []

    protected readonly _expressions: Expression[]
    protected _failed = false

    protected constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    currentMatch(): IndexedToken[] {
        return this._currentMatch.map(([,token]) => token)
    }

    // TODO: Cache
    get matchGroups(): Array<MatchGroup> {
        const innerMatchGroups = this._expressions.filter(it => it.isSuccessful() && isGroupExpression(it)).flatMap(it => (it as GroupExpression).matchGroups)
        return [
            ...this.getMatchGroups(),
            ...innerMatchGroups
        ]
    }

    hasNext(): boolean {
        return !this._failed && (this._idx < this._expressions.length && this._expressions[this._idx]?.hasNext() || this._idx + 1 < this._expressions.length && this._expressions[this._idx + 1]?.hasNext());
    }

    isInitial(): boolean {
        return this._expressions.every(it => it.isInitial());
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc + it.minimumLength, 0);
    }

    abstract isSuccessful(): boolean

    abstract get tracksMatch(): boolean

    backtrack(toTest: IndexedToken[]): BacktrackIteration {
        if (!this.canBacktrack()) {
            return backtrackFailed()
        }

        let backtrackedMatches: IndexedToken[] = []
        // TODO: What if the current expression is not exhausted? E.g. in case of a greedy expression.
        let backtrackIdx = this._expressions.lastIndexOf(last(this._expressions.filter(it => !it.isInitial() && it.isSuccessful() && it.canBacktrack())))
        // TODO: What if the backtracked expression is the last expression?
        if (backtrackIdx === this._expressions.length - 1) {
            const expression = this._expressions[backtrackIdx]
            // TODO: Update cursorPos based on backtracking?
            const backtrackRes = expression.backtrack(toTest)
            // backtrack failed
            if (!backtrackRes.successful) {
                return backtrackFailed()
            }
            const updatedExpressionMatch = expression.isSuccessful() ? expression.currentMatch() : []
            this._currentMatch = orderBy([
                ...this._currentMatch.filter(([idx, ]) => idx !== backtrackIdx),
                ...updatedExpressionMatch.map(it => [backtrackIdx, it] as [number, IndexedToken])
            ], [0])
            return successfulBacktrack(backtrackRes.consumed)
        }

        let backtrackRes = backtrackFailed()
        while (backtrackIdx >= 0) {
            const expression = this._expressions[backtrackIdx]
            const expressionBacktrackRes = expression.backtrack(toTest)
            // backtrack failed
            if (!expressionBacktrackRes.successful) {
                return backtrackFailed()
            }
            // TODO: What if persistedMatch is empty?
            const tail = this._currentMatch.slice(this._currentMatch.length - expressionBacktrackRes.consumed).map(([,token]) => token)
            backtrackedMatches = [...tail, ...backtrackedMatches]
            this._currentMatch = this._currentMatch.slice(0, this._currentMatch.length - expressionBacktrackRes.consumed)

            this._idx = backtrackIdx + 1
            this._expressions.slice(this._idx, this._expressions.length).forEach(it => it.reset())

            this._failed = false
            let forwardFailed = false
            let tokenIdx = 0
            while (this.hasNext() && backtrackedMatches[tokenIdx]) {
                const matchRes = this.matchNext(backtrackedMatches[tokenIdx], backtrackedMatches[tokenIdx - 1], backtrackedMatches[tokenIdx + 1], toTest)
                if (!matchRes.matched) {
                    forwardFailed = true
                    break
                }
                tokenIdx++
            }
            if (forwardFailed || this._failed) {
                backtrackIdx--
                continue
            }
            backtrackRes = successfulBacktrack(expressionBacktrackRes.consumed - tokenIdx)
            break
        }
        return backtrackRes
    }

    canBacktrack(): boolean {
        return this._expressions.some(it => it.isSuccessful() && it.canBacktrack())
    }

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null, toTest: IndexedToken[]): MatchIteration {
        if (!this._expressions[this._idx].hasNext()) {
            if (!this._expressions[this._idx + 1]) {
                return matchFailed()
            }

            this._idx++
        }

        let res
        while (this._idx < this._expressions.length) {
            const nextExpression = this._expressions[this._idx]
            res = nextExpression.matchNext(s, last, next, toTest)
            const updatedExpressionMatch = res.matched || nextExpression.isSuccessful() ? nextExpression.currentMatch() : []
            this._currentMatch = orderBy([
                ...this._currentMatch.filter(([idx, ]) => idx !== this._idx),
                ...updatedExpressionMatch.map(it => [this._idx, it] as [number, IndexedToken])
            ], [0])
            if (!nextExpression.hasNext()) {
                if (!nextExpression.isSuccessful()) {
                    this._failed = true
                    return res
                }
                if (!res.matched) {
                    this._idx++
                    continue;
                }
            }
            if (res.matched) {
                return res
            }
        }
        return matchFailed()
    }

    reset(): void {
        this._idx = 0
        this._expressions.forEach(it => it.reset())
        this._currentMatch = []
        this._failed = false
    }

    private getMatchGroups(): MatchGroup[] {
        if (!this.tracksMatch) {
            return []
        }
        const currentMatch = this.currentMatch()
        const matchedValue = currentMatch.map(it => it.value).join('')
        if (!currentMatch.length) {
            return []
        }
        const lowerBound = currentMatch[0].idx
        const upperBound = currentMatch[currentMatch.length - 1]?.idx + 1
        return [{match: matchedValue, from: lowerBound, to: upperBound}]
    }
}
