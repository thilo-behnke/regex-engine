import {Expression} from "./expression";

export class GroupExpression implements Expression {
    private readonly _expressions: Expression[]
    private _idx: number = 0

    constructor(expressions: Expression[]) {
        this._expressions = expressions;
    }

    hasNext(): boolean {
        return this._idx < this._expressions.length;
    }

    hasNotMatched(): boolean {
        return this._idx == 0;
    }

    isSuccessful(): boolean {
        return this._expressions.every(it => it.isSuccessful());
    }

    backtrack(): boolean {
        return false;
    }

    // TODO: Should be possible?
    canBacktrack(): boolean {
        return false;
    }

    lastMatchCharactersConsumed(): number {
        return this._idx > 0 ? this._expressions[this._idx - 1].lastMatchCharactersConsumed() : 0;
    }

    matchNext(s: string, last?: string, next?: string, isZeroPosMatch?: boolean): boolean {
        if (!this.hasNext()) {
            return false
        }
        const res = this._expressions[this._idx].matchNext(s, last, next, isZeroPosMatch);
        this._idx++
        return res
    }

    reset(): void {
        this._idx = 0
        this._expressions.forEach(it => it.reset())
    }
}
