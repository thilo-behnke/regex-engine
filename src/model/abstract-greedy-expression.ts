import {Expression} from "./expression";
import {IndexedToken} from "../utils/string-utils";

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

    matchNext(s: IndexedToken, previous: IndexedToken = null, next: IndexedToken = null): boolean {
        let wasReset = false
        if (this._expression.isSuccessful()) {
            this._expression.reset()
            wasReset = true
        }

        const res = this._expression.matchNext(s, previous, next)

        if (res) {
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

    lastMatchCharactersConsumed(): number {
        return this._expression.lastMatchCharactersConsumed();
    }

    backtrack(): boolean {
        if (!this.canBacktrack()) {
            return
        }

        const updatedMatch = this._currentMatch.slice(0, this._currentMatch.length - 1)
        this.reset()
        updatedMatch.every((it, idx) => {
            const last = idx > 0 ? updatedMatch[idx - 1] : null
            const next = idx < updatedMatch.length ? updatedMatch[idx + 1] : null
            return this.matchNext(it, last, next)
        })
        if (this._isSuccessful === undefined && this._allowNoMatch) {
            this._isSuccessful = true
        }
        return this._isSuccessful
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
