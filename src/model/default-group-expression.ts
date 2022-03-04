import {Expression} from "./expression";
import {AbstractGroupExpression} from "./abstract-group-expression";

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
        return !this._failed && !!this.currentMatch().length && this._expressions.every(it => it.isSuccessful());
    }

    lastMatchCharactersConsumed(): number {
        return this._lastMatchConsumed;
    }

    currentMatch(): string[] {
        return this.internalMatch
    }

    tracksMatch(): boolean {
        return !this._nonCapturing;
    }
}
