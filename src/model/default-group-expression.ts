import {Expression} from "./expression";
import {AbstractGroupExpression} from "./abstract-group-expression";
import {IndexedToken} from "../utils/string-utils";

export class DefaultGroupExpression extends AbstractGroupExpression {
    protected _nonCapturing: boolean = false

    constructor(...expressions: Expression[]) {
        super(...expressions)
    }

    static nonCapturing(...expressions: Expression[]) {
        const expression = new DefaultGroupExpression(...expressions)
        expression._nonCapturing = true
        return expression
    }

    isSuccessful(): boolean {
        return !this._failed && this._expressions.every(it => it.isSuccessful());
    }

    currentMatch(): IndexedToken[] {
        return this.internalMatch
    }

    get tracksMatch(): boolean {
        return !this._nonCapturing;
    }
}
