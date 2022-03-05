import AbstractGreedyExpression from "./abstract-greedy-expression";
import {Expression} from "./expression";
import GroupExpression from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {IndexedToken} from "../utils/string-utils";

export class GreedyGroupExpression extends AbstractGreedyExpression implements GroupExpression {
    private _groupExpression: GroupExpression
    private _matchGroups: MatchGroup[] = []

    constructor(expression: GroupExpression, allowNoMatch: boolean) {
        super(expression, allowNoMatch);
        this._groupExpression = expression
    }

    get matchGroups(): Array<MatchGroup> {
        return this._matchGroups
    }

    storeCurrentMatch(s: IndexedToken, expressionWasReset: boolean): void {
        if (expressionWasReset) {
            this._currentMatch = [s]
        } else {
            this._currentMatch.push(s)
        }
        this._matchGroups = this._groupExpression.matchGroups
    }

    get tracksMatch(): boolean {
        return this._groupExpression.tracksMatch
    }
}
