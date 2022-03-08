import {Expression} from "./expression";
import {IndexedToken} from "../utils/string-utils";
import {MatchIteration} from "./expression/match-iteration";

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

    isInitial(): boolean {
        return this._expression.isInitial();
    }

    isSuccessful(): boolean {
        return true
    }

    backtrack(): boolean {
        if (!this.canBacktrack()) {
            return false
        }

        return this._expression.backtrack()
    }

    canBacktrack(): boolean {
        return !this._expression.isInitial();
    }

    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken): MatchIteration {
        return this._expression.matchNext(s, last, next);
    }

    get minimumLength(): number {
        return this._expression.minimumLength;
    }

    reset(): void {
        this._expression.reset()
    }
}
