import {Expression} from "./expression";

export default abstract class AbstractGreedyExpression implements Expression {
    private readonly _expression: Expression
    private readonly _allowNoMatch: boolean

    private _hasNext: boolean = true
    private _isSuccessful: boolean = undefined
    protected _currentMatch: string[] = []

    constructor(expression: Expression, allowNoMatch = true) {
        this._expression = expression;
        this._allowNoMatch = allowNoMatch;
    }

    hasNotMatched(): boolean {
        return this._currentMatch.length === 0;
    }

    hasNext(): boolean {
        return this._hasNext;
    }

    isSuccessful(): boolean {
        return !!this._isSuccessful;
    }

    matchNext(s: string, previous: string = null, next: string = null, isZeroPosMatch = false): boolean {
        let wasReset = false
        if (this._expression.isSuccessful()) {
            this._expression.reset()
            wasReset = true
        }

        const res = this._expression.matchNext(s, previous, next, isZeroPosMatch)

        if (res) {
            this.storeCurrentMatch(s, wasReset)
        }

        if (!this._expression.hasNext()) {
            if (this._expression.isSuccessful()) {
                this._isSuccessful = true
            } else {
                this._isSuccessful = this._allowNoMatch || this._isSuccessful
                this._hasNext = false
            }
        }

        return res
    }

    abstract storeCurrentMatch(s: string, expressionWasReset: boolean): void

    lastMatchCharactersConsumed(): number {
        return this._expression.lastMatchCharactersConsumed();
    }

    backtrack(): boolean {
        if (!this.canBacktrack()) {
            return
        }

        const updatedMatch = this._currentMatch.slice(0, this._currentMatch.length - 1)
        this.reset()
        updatedMatch.every(it => this.matchNext(it))
        if (this._isSuccessful === undefined && this._allowNoMatch) {
            this._isSuccessful = true
        }
        return this._isSuccessful
    }

    canBacktrack(): boolean {
        return this._currentMatch.length > 0;
    }

    currentMatch(): string[] {
        return this._currentMatch;
    }

    tracksMatch(): boolean {
        return false;
    }

    reset(): void {
        this._hasNext = true
        this._isSuccessful = undefined
        this._currentMatch = []
        this._expression.reset()
    }
}
