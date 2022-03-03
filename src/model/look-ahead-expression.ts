import {Expression} from "./expression";
import {AbstractGroupExpression} from "./abstract-group-expression";

export class LookAheadExpression extends AbstractGroupExpression {
    private _positive = true

    private constructor(...expressions: Expression[]) {
        super(...expressions);
    }

    static positive(...expressions: Expression[]) {
        const expression = new LookAheadExpression(...expressions)
        expression._positive = true
        return expression
    }

    static negative(...expressions: Expression[]) {
        const expression = new LookAheadExpression(...expressions)
        expression._positive = false
        return expression
    }

    matchNext(s: string, last: string = null, next: string = null, isZeroPosMatch: boolean = null): boolean {
        const matchRes = super.matchNext(s, last, next, isZeroPosMatch);
        return this._positive && matchRes || !this._positive && !matchRes;
    }

    lastMatchCharactersConsumed(): number {
        return 0;
    }

    currentMatch(): string[] {
        return [];
    }

    isSuccessful(): boolean {
        const successful = !this._failed && this._expressions.every(it => it.isSuccessful());
        return this._positive && successful || !this._positive && !successful;
    }

    tracksMatch(): boolean {
        return false;
    }
}
