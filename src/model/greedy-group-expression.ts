import AbstractGreedyExpression from "./abstract-greedy-expression";
import {Expression} from "./expression";

export class GreedyGroupExpression extends AbstractGreedyExpression {
    private _nonCapturing: boolean = false

    constructor(expression: Expression, allowNoMatch: boolean) {
        super(expression, allowNoMatch);
    }

    static nonCapturing(expression: Expression, allowNoMatch = true) {
        const greedyGroup = new GreedyGroupExpression(expression, allowNoMatch)
        greedyGroup._nonCapturing = true
        return greedyGroup
    }

    storeCurrentMatch(s: string, expressionWasReset: boolean): void {
        if (expressionWasReset) {
            this._currentMatch = [s]
        } else {
            this._currentMatch.push(s)
        }
    }

    tracksMatch(): boolean {
        return !this._nonCapturing
    }
}
