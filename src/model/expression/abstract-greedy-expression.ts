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
        let wasReset = false
        if (this._expression.isSuccessful()) {
            this._expression.reset()
            wasReset = true
        }

        const res = this._expression.matchNext(s, previous, next, toTest)

        if (res.matched) {
            this.storeCurrentMatch(s, wasReset)
        }

        if (this._expression.isSuccessful()) {
            this._isSuccessful = true
        } else {
            this._isSuccessful = this._allowNoMatch || this._isSuccessful
            this._hasNext = false
        }

        return res
    }

    abstract storeCurrentMatch(s: IndexedToken, expressionWasReset: boolean): void

    backtrack(toTest: IndexedToken[]): BacktrackIteration {
        if (!this.canBacktrack()) {
            return backtrackFailed()
        }

        const updatedMatch = this._currentMatch.slice(0, this._currentMatch.length - 1)
        this.reset()
        updatedMatch.every((it, idx) => {
            const last = idx > 0 ? updatedMatch[idx - 1] : null
            const next = idx < updatedMatch.length ? updatedMatch[idx + 1] : null
            return this.matchNext(it, last, next, toTest)
        })
        if (this._isSuccessful === undefined && this._allowNoMatch) {
            this._isSuccessful = true
        }
        return this._isSuccessful ? successfulBacktrack() : backtrackFailed()
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
