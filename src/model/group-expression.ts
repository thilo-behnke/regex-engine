import {MatchGroup} from "./match/match-group";
import {Expression} from "./expression";

export default interface GroupExpression extends Expression {
    get matchGroups(): Array<MatchGroup>
    get tracksMatch(): boolean
}

export const isGroupExpression = (expr: Expression): expr is GroupExpression => {
    return (expr as GroupExpression).matchGroups !== undefined;
}
