import {Expression} from "./expression";
import {IndexedToken} from "@utils/string-utils";
import {matchFailed, MatchIteration} from "./match-iteration";
import {last, max, min, range} from "@utils/array-utils";
import groupBy = require("lodash.groupby");
import any = jasmine.any;
import {BacktrackIteration, backtrackFailed} from "./backtrack-iteration";

export default class AlternativeExpression implements Expression {
    private readonly _expressions: Expression[]
    private _idx: number = 0

    private _successfulExpressions: {[idx: number]: Expression} = {}

    constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    currentMatch(): IndexedToken[] {
        return this._successfulExpressions[this._idx]?.currentMatch() ?? [];
    }

    hasNext(): boolean {
        return !this._successfulExpressions[this._idx] && this._expressions.some(it => it.hasNext())
    }

    isInitial(): boolean {
        return this._expressions.every(it => it.isInitial())
    }

    isSuccessful(): boolean {
        return !!this._successfulExpressions[this._idx];
    }

    backtrack(toTest: IndexedToken[]): BacktrackIteration {
        if (!this.canBacktrack()) {
            return backtrackFailed()
        }

        const matchBeforeBacktrack = this.currentMatch()
        const expressionsByMaxMatchLength = groupBy(this._expressions, it => it.currentMatch.length)
        const maxMatchLength = max(Object.keys(expressionsByMaxMatchLength))

        this._successfulExpressions = {}
        let backtrackResult = backtrackFailed()
        expressionsByMaxMatchLength[maxMatchLength].forEach((it: Expression) => {
            const res = it.backtrack(toTest)
            backtrackResult = backtrackResult.successful ? backtrackResult : res
        })

        this._expressions.forEach((it, idx) => {
            if (it.isSuccessful()) {
                this._successfulExpressions[idx] = it
            }
        })

        this._idx = min(Object.keys(this._successfulExpressions).map(it => parseInt(it))) ?? 0

        const matchAfterBacktrack = this.currentMatch()
        if (matchAfterBacktrack && matchAfterBacktrack.length < matchBeforeBacktrack.length) {
            return {successful: true, consumed: matchBeforeBacktrack.length - matchAfterBacktrack.length}
        }

        return backtrackResult
    }

    canBacktrack(): boolean {
        return this._expressions.some(it => it.canBacktrack());
    }

    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken, toTest: IndexedToken[]): MatchIteration {
        if (!this.hasNext()) {
            return matchFailed()
        }

        let anyMatch = false
        this._expressions.filter(it => it.hasNext()).forEach((it, idx) => {
            // TODO: What about the consumed tokens here? Should always be 1 or 0 in the end?
            anyMatch = it.matchNext(s, last, next, toTest).matched || anyMatch
            if (it.isSuccessful() && !it.hasNext()) {
                this._successfulExpressions[idx] = it
            }
        })

        if (!this._expressions[this._idx].hasNext() && !this._successfulExpressions[this._idx]) {
            this._idx++
        }

        return {matched: anyMatch, consumed: anyMatch ? 1 : 0}
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc === -1 || it.minimumLength < acc ? it.minimumLength : acc, -1);
    }

    reset(): void {
        this._expressions.forEach(it => it.reset())
        this._idx = 0
        this._successfulExpressions = {}
    }
}
