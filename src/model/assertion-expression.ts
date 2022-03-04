import {Expression} from "./expression";
import {AbstractGroupExpression} from "./abstract-group-expression";
import {IndexedToken} from "../utils/string-utils";

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

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): boolean {
        const matchRes = super.matchNext(s, last, next);
        return this._positive && matchRes || !this._positive && !matchRes;
    }

    lastMatchCharactersConsumed(): number {
        return 0;
    }

    currentMatch(): IndexedToken[] {
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
