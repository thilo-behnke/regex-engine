import {SimpleExpression} from "./simple-expression";
import {Expression} from "./expression";
import Character from "./character";
import {NegatedSimpleExpression} from "./negated-simple-expression";

export default class BracketExpression implements Expression {
    private readonly _expressions: (SimpleExpression|NegatedSimpleExpression)[]
    protected _anyMatch = true

    private _isSuccessful: boolean = undefined;
    private _successfulExpression: Expression = undefined;

    constructor(...expressions: (SimpleExpression|NegatedSimpleExpression)[]) {
        this._expressions = expressions;
    }

    static negated(...expressions: SimpleExpression[]): Expression {
        const expression = new BracketExpression(...expressions.map(it => new NegatedSimpleExpression(it)))
        expression._anyMatch = false
        return expression
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
                    if (!this._anyMatch) {
                        return false
                    }
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
