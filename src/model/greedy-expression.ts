import {Expression} from "./expression";

export default class GreedyExpression implements Expression {
    private readonly _expression: Expression
    private readonly _allowNoMatch: boolean

    private _hasNext: boolean = true
    private _isSuccessful: boolean = undefined
    private _currentMatch: string[] = []

    constructor(expression: Expression, allowNoMatch = true) {
        this._expression = expression;
        this._allowNoMatch = allowNoMatch;
    }

    hasNext(): boolean {
        return this._hasNext;
    }

    isSuccessful(): boolean {
        return !!this._isSuccessful;
    }

    matchNext(s: string, previous: string = null, next: string = null, isZeroPosMatch = false): boolean {
        if (this._expression.isSuccessful()) {
            this._expression.reset()
        }

        const res = this._expression.matchNext(s, previous, next, isZeroPosMatch)

        if (res) {
           this._currentMatch.push(s)
        }

        if (!this._expression.hasNext()) {
            if (this._expression.isSuccessful()) {
                this._isSuccessful = true
                return true
            } else {
                this._isSuccessful = this._allowNoMatch || this._isSuccessful
                this._hasNext = false
                return this._isSuccessful
            }
        }

        return res
    }

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
        return this._isSuccessful
    }

    canBacktrack(): boolean {
        return true;
    }

    reset(): void {
        this._hasNext = true
        this._isSuccessful = undefined
        this._expression.reset()
    }
}
