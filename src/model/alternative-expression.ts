import {Expression} from "./expression";
import {IndexedToken} from "../utils/string-utils";
import GroupExpression from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {matchFailed, MatchIteration} from "./expression/match-iteration";

export default class AlternativeExpression implements Expression {
    private readonly _expressions: Expression[]

    private _idx: number = 0
    private _successfulExpression: Expression = null

    constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    currentMatch(): IndexedToken[] {
        return this._expressions[this._idx].currentMatch();
    }

    hasNext(): boolean {
        return !this._successfulExpression && !!this._expressions[this._idx]
    }

    isInitial(): boolean {
        return this._idx === 0;
    }

    isSuccessful(): boolean {
        return !!this._successfulExpression;
    }

    backtrack(): boolean {
        return false;
    }

    canBacktrack(): boolean {
        return false;
    }

    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken, toTest: IndexedToken[], cursorPos: number): MatchIteration {
        if (!this._expressions[this._idx].hasNext()) {
            this._idx++
        }
        if (!this.hasNext()) {
            return matchFailed()
        }

        let anyMatch = false
        this._expressions.filter(it => it.hasNext()).forEach(it => {
            // TODO: What about the consumed tokens here? Should always be 1 or 0 in the end?
            anyMatch = it.matchNext(s, last, next, toTest, cursorPos).matched
        })

        // this._successfulExpression = this._e

        return {matched: anyMatch, consumed: anyMatch ? 1 : 0}
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc === -1 || it.minimumLength < acc ? it.minimumLength : acc, -1);
    }

    reset(): void {
        this._expressions.forEach(it => it.reset())
        this._idx = 0
        this._successfulExpression = null
    }
}
