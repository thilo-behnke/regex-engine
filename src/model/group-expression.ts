import {MatchGroup} from "./match/match-group";

export default interface GroupExpression {
    get matchGroups(): Array<MatchGroup>
}
