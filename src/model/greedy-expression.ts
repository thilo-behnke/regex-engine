import AbstractGreedyExpression from "./abstract-greedy-expression";
import {IndexedToken} from "@utils/string-utils";

export default class GreedyExpression extends AbstractGreedyExpression {
    storeCurrentMatch(s: IndexedToken, expressionWasReset: boolean): void {
        this._currentMatch.push(s)
    }
}
