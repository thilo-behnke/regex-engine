import {SimpleExpression} from "./simple-expression";
import {Expression} from "./expression";
import Character from "./character";

export default class BracketExpression implements Expression {
    private readonly _expressions: SimpleExpression[]

    private _isSuccessful: boolean = undefined;
    private _successfulExpression: Expression = undefined;

    constructor(...expressions: SimpleExpression[]) {
        this._expressions = expressions;
    }

    hasNotMatched(): boolean {
        return this._isSuccessful === undefined;
    }

    hasNext(): boolean {
        return this.isSuccessful() == undefined;
    }

    isSuccessful(): boolean {
        return this._isSuccessful;
    }

    matchNext(s: string, previous: string = null, next: string = null, isZeroPosMatch = false): boolean {
        for (let expression of this._expressions) {
            while(expression.hasNext()) {
                const res = expression.matchNext(s, previous, next, isZeroPosMatch)
                if (!res) {
                    this._isSuccessful = false
                    break
                }
            }
            if (expression.isSuccessful()) {
                this._isSuccessful = true
                this._successfulExpression = expression
                return true
            }
        }
        return this._isSuccessful
    }

    lastMatchCharactersConsumed(): number {
        return this._successfulExpression?.lastMatchCharactersConsumed() || 0;
    }

    backtrack(): boolean {
        return false;
    }

    canBacktrack(): boolean {
        return false;
    }

    reset(): void {
        this._isSuccessful = undefined
        this._successfulExpression = undefined
        this._expressions.forEach(it => it.reset())
    }
}
