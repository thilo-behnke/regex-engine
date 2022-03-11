import {Expression} from "./expression";
import FixedLengthExpression from "./fixed-length-expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {IndexedToken} from "../utils/string-utils";
import {matchFailed, MatchIteration} from "./expression/match-iteration";
import {last} from "../utils/array-utils";
import orderBy = require("lodash.orderby");

export abstract class AbstractGroupExpression implements Expression, GroupExpression {
    private _idx: number = 0
    private _currentMatch: Array<[number, IndexedToken]> = []
    private _matchGroups: {[idx: number]: MatchGroup[]} = {}

    protected readonly _expressions: Expression[]
    protected _failed = false

    protected constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    protected get internalMatch(): IndexedToken[] {
        return this._currentMatch.map(([,token]) => token);
    }

    abstract currentMatch(): IndexedToken[]

    get matchGroups(): Array<MatchGroup> {
        return Object.values(this._matchGroups).flat();
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

    backtrack(): boolean {
        if (!this.canBacktrack()) {
            return false
        }

        let backtrackedMatches = []
        // TODO: What if the current expression is not exhausted? E.g. in case of a greedy expression.
        let backtrackIdx = this._expressions.lastIndexOf(last(this._expressions.filter(it => !it.isInitial() && it.isSuccessful() && it.canBacktrack())))
        let backtrackSuccessful = false
        while (backtrackIdx > 0) {
            const expression = this._expressions[backtrackIdx]
            const backtrackRes = expression.backtrack()
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
                const matchRes = this.matchNext(backtrackedMatches[tokenIdx], backtrackedMatches[tokenIdx - 1], backtrackedMatches[tokenIdx + 1])
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

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): MatchIteration {
        if (!this._expressions[this._idx].hasNext()) {
            if (!this._expressions[this._idx + 1]) {
                return matchFailed()
            }

            this._idx++
        }

        let res
        while (this._idx < this._expressions.length) {
            const nextExpression = this._expressions[this._idx]
            res = nextExpression.matchNext(s, last, next)
            const updatedExpressionMatch = res.matched || nextExpression.isSuccessful() ? nextExpression.currentMatch() : []
            this._currentMatch = orderBy([
                ...this._currentMatch.filter(([idx, ]) => idx !== this._idx),
                ...updatedExpressionMatch.map(it => [this._idx, it] as [number, IndexedToken])
            ], [0])
            if (!nextExpression.hasNext()) {
                if (nextExpression.isSuccessful()) {
                    if (this.tracksMatch) {
                        const currentMatch = this.currentMatch()
                        const matchedValue = currentMatch.map(it => it.value).join('')
                        if (currentMatch.length) {
                            const lowerBound = currentMatch[0].idx
                            const upperBound = currentMatch[currentMatch.length - 1]?.idx + 1
                            this._matchGroups[-1] = [{match: matchedValue, from: lowerBound, to: upperBound}]
                        }
                    }
                    if (isGroupExpression(nextExpression)) {
                        this._matchGroups[this._idx] = nextExpression.matchGroups
                    }
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
        this._matchGroups = []
        this._failed = false
    }
}
