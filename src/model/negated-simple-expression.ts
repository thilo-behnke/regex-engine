import {Expression} from "./expression";
import {SimpleExpression} from "./simple-expression";
import {IndexedToken} from "../utils/string-utils";
import {matchFailed, MatchIteration} from "./expression/match-iteration";

export class NegatedSimpleExpression implements Expression {
    private readonly _delegate: SimpleExpression
    private _currentMatch: IndexedToken[] = []

    constructor(delegate: SimpleExpression) {
        this._delegate = delegate;
    }

    hasNext(): boolean {
        return this._delegate.hasNext();
    }

    isInitial(): boolean {
        return this._delegate.isInitial();
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

    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken, toTest: IndexedToken[], cursorPos: number): MatchIteration {
        if (s === null) {
            return matchFailed()
        }
        const delegateRes = this._delegate.matchNext(s, last, next, toTest, cursorPos);
        this._currentMatch = !delegateRes.matched ? [s] : []
        return delegateRes.matched ? matchFailed() : {matched: true, consumed: delegateRes.cursorOnly ? 0 : 1}
    }

    currentMatch(): IndexedToken[] {
        return this._currentMatch;
    }

    reset(): void {
        this._delegate.reset()
        this._currentMatch = []
    }
}
