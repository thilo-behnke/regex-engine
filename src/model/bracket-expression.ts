import {SimpleExpression} from "./simple-expression";
import {Expression} from "./expression";

export default class BracketExpression implements Expression {
    private readonly _expressions: SimpleExpression[]

    private _isSuccessful: boolean = undefined;

    constructor(...expressions: SimpleExpression[]) {
        this._expressions = expressions;
    }

    hasNext(): boolean {
        return this.isSuccessful() == undefined;
    }

    isSuccessful(): boolean {
        return this._isSuccessful;
    }

    matchNext(s: string): boolean {
        for (let expression of this._expressions) {
            while(expression.hasNext()) {
                const res = expression.matchNext(s)
                if (!res) {
                    this._isSuccessful = false
                    break
                }
            }
            if (expression.isSuccessful()) {
                this._isSuccessful = true
                return true
            }
        }
    }

    backtrack(): boolean {
        return false;
    }

    canBacktrack(): boolean {
        return false;
    }

    reset(): void {
        this._isSuccessful = undefined
        this._expressions.forEach(it => it.reset())
    }
}
