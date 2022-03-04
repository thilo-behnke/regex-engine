import {Expression} from "./expression";
import {IndexedToken} from "../utils/string-utils";

export class OptionalExpression implements Expression {
    private _expression: Expression

    constructor(expression: Expression) {
        this._expression = expression;
    }

    currentMatch(): IndexedToken[] {
        return this._expression.currentMatch();
    }

    hasNext(): boolean {
        return this._expression.hasNext();
    }

    hasNotMatched(): boolean {
        return this._expression.hasNotMatched();
    }

    isSuccessful(): boolean {
        return this._expression.hasNotMatched() || this._expression.isSuccessful();
    }

    tracksMatch(): boolean {
        return false;
    }

    backtrack(): boolean {
        if (!this.canBacktrack()) {
            return false
        }

        return this._expression.backtrack()
    }

    canBacktrack(): boolean {
        return !this._expression.hasNotMatched();
    }

    lastMatchCharactersConsumed(): number {
        return this._expression.lastMatchCharactersConsumed();
    }

    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken): boolean {
        return this._expression.matchNext(s, last, next);
    }

    get minimumLength(): number {
        return this._expression.minimumLength;
    }

    reset(): void {
        this._expression.reset()
    }
}
