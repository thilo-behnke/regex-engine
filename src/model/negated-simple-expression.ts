import {Expression} from "./expression";
import {SimpleExpression} from "./simple-expression";

export class NegatedSimpleExpression implements Expression {
    private readonly _delegate: SimpleExpression
    private _currentMatch: string[] = []

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

    backtrack(isZeroPosMatch: boolean): boolean {
        return this._delegate.backtrack(isZeroPosMatch);
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
        const delegateRes = !this._delegate.matchNext(s, last, next, isZeroPosMatch);
        this._currentMatch = delegateRes ? [s] : []
        return delegateRes
    }

    currentMatch(): string[] {
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
