import {Expression} from "./expression";
import FixedLengthExpression from "./fixed-length-expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {IndexedToken} from "../utils/string-utils";
import {matchFailed, MatchIteration} from "./expression/match-iteration";
import {last} from "../utils/array-utils";

export abstract class AbstractGroupExpression implements Expression, GroupExpression {
    private _idx: number = 0
    private _persistedMatch: IndexedToken[] = []
    private _currentMatch: IndexedToken[] = []
    private _matchGroups: MatchGroup[] = []

    protected readonly _expressions: Expression[]
    protected _failed = false

    protected constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    protected get internalMatch() {
        return [...this._persistedMatch, ...this._currentMatch];
    }

    abstract currentMatch(): IndexedToken[]

    get matchGroups(): Array<MatchGroup> {
        return this._matchGroups;
    }

    hasNext(): boolean {
        return !this._failed && (this._idx < this._expressions.length && this._expressions[this._idx]?.hasNext() || this._idx + 1 < this._expressions.length && this._expressions[this._idx + 1]?.hasNext());
    }

    isInitial(): boolean {
        return this._idx === 0;
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc + it.minimumLength, 0);
    }

    abstract isSuccessful(): boolean

    abstract get tracksMatch(): boolean

    backtrack(): boolean {
        if (!this.canBacktrack()) {
            return false
        }

        let backtrackedMatches = []
        // TODO: What if the current expression is not exhausted? E.g. in case of a greedy expression.
        let backtrackIdx = this._expressions.lastIndexOf(last(this._expressions.filter(it => !it.isInitial() && it.isSuccessful() && it.canBacktrack())))
        let backtrackSuccessful = false
        while (backtrackIdx > 0) {
            const expression = this._expressions[backtrackIdx]
            const backtrackRes = expression.backtrack()
            // backtrack failed
            if (!backtrackRes) {
                return false
            }
            // TODO: What if persistedMatch is empty?
            backtrackedMatches.unshift(last(this._persistedMatch))
            this._persistedMatch = this._persistedMatch.slice(0, this._persistedMatch.length - 1)
            this._idx = backtrackIdx + 1
            this._expressions.slice(this._idx, this._expressions.length).forEach(it => it.reset())

            this._failed = false
            let forwardFailed = false
            let tokenIdx = 0
            while (this.hasNext() && backtrackedMatches[tokenIdx]) {
                const matchRes = this.matchNext(backtrackedMatches[tokenIdx], backtrackedMatches[tokenIdx - 1], backtrackedMatches[tokenIdx + 1])
                if (!matchRes.matched) {
                    forwardFailed = true
                    break
                }
                tokenIdx++
            }
            if (forwardFailed || this._failed) {
                backtrackIdx--
                continue
            }
            backtrackSuccessful = true
            break
        }
        return backtrackSuccessful
    }

    canBacktrack(): boolean {
        return this._expressions.some(it => it.isSuccessful() && it.canBacktrack())
    }

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): MatchIteration {
        if (!this._expressions[this._idx].hasNext()) {
            if (!this._expressions[this._idx + 1]) {
                return matchFailed()
            }

            this._idx++
        }

        let res
        while (this._idx < this._expressions.length) {
            const nextExpression = this._expressions[this._idx]
            res = nextExpression.matchNext(s, last, next)
            this._currentMatch = res.matched || nextExpression.isSuccessful() ? nextExpression.currentMatch() : []
            if (!nextExpression.hasNext()) {
                if (nextExpression.isSuccessful()) {
                    this._persistedMatch = this.currentMatch()
                    this._currentMatch = []
                    this._matchGroups = []
                    if (this.tracksMatch) {
                        const matchedValue = this._persistedMatch.map(it => it.value).join('')
                        if (this._persistedMatch.length) {
                            const lowerBound = this._persistedMatch[0].idx
                            const upperBound = this._persistedMatch[this._persistedMatch.length - 1]?.idx + 1
                            this._matchGroups = [{match: matchedValue, from: lowerBound, to: upperBound}]
                        }
                    }
                    if (isGroupExpression(nextExpression)) {
                        this._matchGroups = [...this.matchGroups, ...nextExpression.matchGroups]
                    }
                } else {
                    this._failed = true
                    this._currentMatch = []
                }

                if (!res.matched) {
                    this._idx++
                    continue;
                }
            }
            if (res.matched) {
                return res
            }
        }
        return matchFailed()
    }

    reset(): void {
        this._idx = 0
        this._expressions.forEach(it => it.reset())
        this._currentMatch = []
        this._persistedMatch = []
        this._matchGroups = []
        this._failed = false
    }
}
