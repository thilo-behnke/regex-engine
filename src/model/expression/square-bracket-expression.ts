import {SimpleExpression} from "./simple-expression";
import {Expression} from "./expression";
import {NegatedSimpleExpression} from "./negated-simple-expression";
import {IndexedToken} from "@utils/string-utils";
import {matchFailed, MatchIteration} from "./match-iteration";

export default class SquareBracketExpression implements Expression {
    private readonly _expressions: (SimpleExpression|NegatedSimpleExpression)[]
    protected _anyMatch = true

    private _isSuccessful: boolean = undefined;
    private _successfulExpression: Expression = undefined;
    private _currentMatch: IndexedToken[] = []

    constructor(...expressions: (SimpleExpression|NegatedSimpleExpression)[]) {
        this._expressions = expressions;
    }

    static negated(...expressions: SimpleExpression[]): Expression {
        const expression = new SquareBracketExpression(...expressions.map(it => new NegatedSimpleExpression(it)))
        expression._anyMatch = false
        return expression
    }

    isInitial(): boolean {
        return this.isSuccessful() === undefined;
    }

    hasNext(): boolean {
        return this.isSuccessful() === undefined;
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc + it.minimumLength, 0);
    }

    isSuccessful(): boolean {
        return this._isSuccessful;
    }

    matchNext(s: IndexedToken, previous: IndexedToken, next: IndexedToken, toTest: IndexedToken[]): MatchIteration {
        if (!this.hasNext()) {
            return matchFailed()
        }
        if (!this._expressions.length) {
            return {matched: true, consumed: 0}
        }
        // TODO: Isn't this multiple alternatives?
        let consumed = 0
        for (let expression of this._expressions) {
            while(expression.hasNext()) {
                const res = expression.matchNext(s, previous, next, toTest)
                if (!res.matched) {
                    this._isSuccessful = false
                    this._currentMatch = []
                    if (!this._anyMatch) {
                        return matchFailed()
                    }
                    break
                }
                consumed += res.consumed
            }
            if (expression.isSuccessful()) {
                this._isSuccessful = true
                this._currentMatch = [s]
                this._successfulExpression = expression
                return {matched: true, consumed}
            }
        }
        return matchFailed()
    }

    backtrack(toTest: IndexedToken[]): boolean {
        return false;
    }

    canBacktrack(): boolean {
        return false;
    }

    currentMatch(): IndexedToken[] {
        return this._currentMatch;
    }

    reset(): void {
        this._isSuccessful = undefined
        this._successfulExpression = undefined
        this._expressions.forEach(it => it.reset())
        this._currentMatch = []
    }
}
