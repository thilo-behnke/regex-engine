import {Expression} from "./expression";
import {SimpleExpression} from "./simple-expression";
import {IndexedToken} from "../utils/string-utils";

export class NegatedSimpleExpression implements Expression {
    private readonly _delegate: SimpleExpression
    private _currentMatch: IndexedToken[] = []

    constructor(delegate: SimpleExpression) {
        this._delegate = delegate;
    }

    hasNext(): boolean {
        return this._delegate.hasNext();
    }

    hasNotMatched(): boolean {
        return this._delegate.hasNotMatched();
    }

    get minimumLength(): number {
        return this._delegate.minimumLength;
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

    matchNext(s: IndexedToken, last?: IndexedToken, next?: IndexedToken): boolean {
        if (s === null) {
            return false
        }
        const delegateRes = !this._delegate.matchNext(s, last, next);
        this._currentMatch = delegateRes ? [s] : []
        return delegateRes
    }

    currentMatch(): IndexedToken[] {
        return this._currentMatch;
    }

    tracksMatch(): boolean {
        return false;
    }

    reset(): void {
        this._delegate.reset()
        this._currentMatch = []
    }
}
