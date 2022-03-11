import GroupExpression from "./group-expression";
import {IndexedToken} from "../utils/string-utils";
import {MatchGroup} from "./match/match-group";
import AlternativeExpression from "./alternative-expression";

export class AlternativeGroupExpression extends AlternativeExpression implements GroupExpression {
    private readonly _groupExpression: GroupExpression[]

    constructor(...expressions: GroupExpression[]) {
        super(...expressions)
        this._groupExpression = expressions;
    }

    get matchGroups(): Array<MatchGroup> {
        return this._groupExpression.flatMap(it => it.matchGroups);
    }
    get tracksMatch(): boolean {
        return this._groupExpression.some(it => it.tracksMatch);
    }
}
