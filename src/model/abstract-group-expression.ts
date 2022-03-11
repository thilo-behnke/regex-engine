import {Expression} from "./expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {IndexedToken} from "../utils/string-utils";
import {matchFailed, MatchIteration} from "./expression/match-iteration";
import {last} from "../utils/array-utils";
import orderBy = require("lodash.orderby");

export abstract class AbstractGroupExpression implements Expression, GroupExpression {
    private _idx: number = 0
    private _currentMatch: Array<[number, IndexedToken]> = []

    protected readonly _expressions: Expression[]
    protected _failed = false

    protected constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    protected get internalMatch(): IndexedToken[] {
        return this._currentMatch.map(([,token]) => token);
    }

    abstract currentMatch(): IndexedToken[]

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
        return this._idx === 0;
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc + it.minimumLength, 0);
    }

    abstract isSuccessful(): boolean

    abstract get tracksMatch(): boolean

    backtrack(toTest: IndexedToken[]): boolean {
        if (!this.canBacktrack()) {
            return false
        }

        let backtrackedMatches = []
        // TODO: What if the current expression is not exhausted? E.g. in case of a greedy expression.
        let backtrackIdx = this._expressions.lastIndexOf(last(this._expressions.filter(it => !it.isInitial() && it.isSuccessful() && it.canBacktrack())))
        // TODO: What if the backtracked expression is the last expression?
        if (backtrackIdx === this._expressions.length - 1) {
            const expression = this._expressions[backtrackIdx]
            // TODO: Update cursorPos based on backtracking?
            const backtrackRes = expression.backtrack(toTest)
            // backtrack failed
            if (!backtrackRes) {
                return false
            }
            const updatedExpressionMatch = expression.isSuccessful() ? expression.currentMatch() : []
            this._currentMatch = orderBy([
                ...this._currentMatch.filter(([idx, ]) => idx !== backtrackIdx),
                ...updatedExpressionMatch.map(it => [backtrackIdx, it] as [number, IndexedToken])
            ], [0])
            return true
        }

        let backtrackSuccessful = false
        while (backtrackIdx >= 0) {
            const expression = this._expressions[backtrackIdx]
            const backtrackRes = expression.backtrack(toTest)
            // backtrack failed
            if (!backtrackRes) {
                return false
            }
            // TODO: What if persistedMatch is empty?
            const lastToken = last(this._currentMatch)[1]
            backtrackedMatches.unshift(lastToken)
            this._currentMatch = this._currentMatch.slice(0, this._currentMatch.length - 1)

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
            backtrackSuccessful = true
            break
        }
        return backtrackSuccessful
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
                if (nextExpression.isSuccessful()) {
                } else {
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
