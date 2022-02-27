import AbstractGreedyExpression from "./abstract-greedy-expression";

export class GreedyGroupExpression extends AbstractGreedyExpression {
    storeCurrentMatch(s: string, expressionWasReset: boolean): void {
        if (expressionWasReset) {
            this._currentMatch = [s]
        } else {
            this._currentMatch.push(s)
        }
    }

    tracksMatch(): boolean {
        return true
    }
}
