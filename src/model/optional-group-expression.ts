import {OptionalExpression} from "./optional-expression";
import GroupExpression from "./group-expression";
import {Expression} from "./expression";
import {MatchGroup} from "./match/match-group";

export class OptionalGroupExpression extends OptionalExpression implements GroupExpression {
    private _groupExpression: GroupExpression

    constructor(expression: GroupExpression) {
        super(expression);
        this._groupExpression = expression
    }

    get matchGroups(): Array<MatchGroup> {
        return this._groupExpression.matchGroups;
    }
}
