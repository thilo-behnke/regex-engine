import {Expression} from "./expression";
import {IndexedToken} from "@utils/string-utils";
import {MatchIteration} from "./match-iteration";
import {BacktrackIteration, backtrackFailed, successfulBacktrack} from "./backtrack-iteration";

export default abstract class AbstractGreedyExpression implements Expression {
    private readonly _expression: Expression
    private readonly _allowNoMatch: boolean

    private _hasNext = true
    private _isSuccessful: boolean = undefined
    protected _currentMatch: IndexedToken[] = []

    constructor(expression: Expression, allowNoMatch = true) {
        this._expression = expression;
        this._allowNoMatch = allowNoMatch;
    }

    isInitial(): boolean {
        return this._currentMatch.length === 0;
    }

    hasNext(): boolean {
        return this._hasNext
    }

    get minimumLength(): number {
        return this._allowNoMatch ? 0 : this._expression.minimumLength;
    }

    isSuccessful(): boolean {
        return !!this._isSuccessful;
    }

    matchNext(s: IndexedToken, previous: IndexedToken = null, next: IndexedToken = null, toTest: IndexedToken[]): MatchIteration {
        if (this._expression.isSuccessful() && !this._expression.hasNext()) {
            this._expression.reset()
        }

        const res = this._expression.matchNext(s, previous, next, toTest)

        if (res.matched) {
            this.storeCurrentMatch(s)
        } else {
            this._hasNext = false
        }

        if (this._expression.isSuccessful()) {
            this._isSuccessful = true
        } else {
            this._isSuccessful = this.isInitial() && this._allowNoMatch || this._isSuccessful
        }

        return res
    }

    abstract storeCurrentMatch(s: IndexedToken): void

    backtrack(toTest: IndexedToken[]): BacktrackIteration {
        if (!this.canBacktrack()) {
            return backtrackFailed()
        }

        const matchLengthBeforeBacktrack = this._currentMatch.length
        let updatedMatch = this._currentMatch.slice(0, this._currentMatch.length - 1)
        while (updatedMatch.length) {
            this.reset()
            updatedMatch.every((it, idx) => {
                const last = idx > 0 ? updatedMatch[idx - 1] : null
                const next = idx < updatedMatch.length ? updatedMatch[idx + 1] : null
                return this.matchNext(it, last, next, toTest)
            })
            if (this._expression.isSuccessful()) {
                break
            }
            updatedMatch = this._currentMatch.slice(0, this._currentMatch.length - 1)
        }
        if (!updatedMatch.length) {
            this.reset()
            this._isSuccessful = this._allowNoMatch
        }
        // TODO: What if the backtrack leaves the expression in an inconsistent state? E.g. a greedy group where the group is no longer successful but could be backtracked further?
        return this._isSuccessful ? successfulBacktrack(matchLengthBeforeBacktrack - this._currentMatch.length) : backtrackFailed()
    }

    canBacktrack(): boolean {
        return this._currentMatch.length > 0;
    }

    currentMatch(): IndexedToken[] {
        return this._currentMatch;
    }

    reset(): void {
        this._hasNext = true
        this._isSuccessful = undefined
        this._currentMatch = []
        this._expression.reset()
    }
}
