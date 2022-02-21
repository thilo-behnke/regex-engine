import {Expression} from "./expression";

export default class GreedyExpression implements Expression {
    private readonly _expression: Expression
    private readonly _allowNoMatch: boolean

    private _hasNext: boolean = true
    private _isSuccessful: boolean = undefined

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

    matchNext(s: string): boolean {
        const res = this._expression.matchNext(s)

        if (!this._expression.hasNext()) {
            if (this._expression.isSuccessful()) {
                this._isSuccessful = true
                this._expression.reset()
                return true
            } else {
                this._isSuccessful = this._allowNoMatch || this._isSuccessful
                this._hasNext = false
                return this._isSuccessful
            }
        }

        return res
    }

    reset(): void {
        this._hasNext = true
        this._isSuccessful = undefined
        this._expression.reset()
    }
}
