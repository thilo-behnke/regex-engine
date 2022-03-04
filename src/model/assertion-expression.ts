import {Expression} from "./expression";
import {AbstractGroupExpression} from "./abstract-group-expression";
import {GroupExpressionType} from "./parser/group-expression-type";

export class AssertionExpression extends AbstractGroupExpression {
    private _positive = true
    private _type: AssertionType = undefined

    private constructor(...expressions: Expression[]) {
        super(...expressions);
    }

    public get type(): AssertionType {
        return this._type
    }

    static positiveLookahead(...expressions: Expression[]) {
        const expression = new AssertionExpression(...expressions)
        expression._positive = true
        expression._type = AssertionType.LOOKAHEAD
        return expression
    }

    static negativeLookahead(...expressions: Expression[]) {
        const expression = new AssertionExpression(...expressions)
        expression._positive = false
        expression._type = AssertionType.LOOKAHEAD
        return expression
    }

    static positiveLookbehind(...expressions: Expression[]) {
        const expression = new AssertionExpression(...expressions)
        expression._positive = true
        expression._type = AssertionType.LOOKBEHIND
        return expression
    }

    static negativeLookbehind(...expressions: Expression[]) {
        const expression = new AssertionExpression(...expressions)
        expression._positive = false
        expression._type = AssertionType.LOOKBEHIND
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

export enum AssertionType {
    LOOKAHEAD = 'LOOKAHEAD',
    LOOKBEHIND = 'LOOKBEHIND'
}
