import {Expression} from "./expression";
import {SimpleExpression} from "./simple-expression";

export class NegatedSimpleExpression implements Expression {
    private readonly _delegate: SimpleExpression

    constructor(delegate: SimpleExpression) {
        this._delegate = delegate;
    }

    hasNext(): boolean {
        return this._delegate.hasNext();
    }

    hasNotMatched(): boolean {
        return this._delegate.hasNotMatched();
    }

    isSuccessful(): boolean {
        return !this._delegate.isSuccessful();
    }

    backtrack(): boolean {
        return this._delegate.backtrack();
    }

    canBacktrack(): boolean {
        return this._delegate.canBacktrack();
    }

    lastMatchCharactersConsumed(): number {
        return this._delegate.lastMatchCharactersConsumed();
    }

    matchNext(s: string, last?: string, next?: string, isZeroPosMatch?: boolean): boolean {
        if (s === null) {
            return false
        }
        return !this._delegate.matchNext(s, last, next, isZeroPosMatch);
    }

    reset(): void {
        this._delegate.reset()
    }
}
