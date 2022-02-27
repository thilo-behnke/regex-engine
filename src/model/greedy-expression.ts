import {Expression} from "./expression";
import AbstractGreedyExpression from "./abstract-greedy-expression";

export default class GreedyExpression extends AbstractGreedyExpression {
    storeCurrentMatch(s: string, expressionWasReset: boolean): void {
        this._currentMatch.push(s)
    }
}
