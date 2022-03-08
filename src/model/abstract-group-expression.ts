import {Expression} from "./expression";
import FixedLengthExpression from "./fixed-length-expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {IndexedToken} from "../utils/string-utils";
import {matchFailed, MatchIteration} from "./expression/match-iteration";

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
        return !this._failed && this._idx < this._expressions.length && this._expressions[this._idx].hasNext();
    }

    isInitial(): boolean {
        return this._idx == 0;
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

        const updatedMatch = this._persistedMatch.slice(0, this._persistedMatch.length - 1)
        this.reset()
        let sIdx = 0
        // TODO: Basically a regex engine within the group?
        let hasMatched = true
        while(hasMatched) {
            const thisChar = updatedMatch[sIdx]
            const last = sIdx > 0 ? updatedMatch[sIdx - 1] : null
            const next = sIdx < updatedMatch.length ? updatedMatch[sIdx + 1] : null
            hasMatched = this.matchNext(thisChar, last, next).matched
            sIdx++
        }

        this._failed = this._expressions.some(it => !it.isSuccessful())
        this._persistedMatch = this.currentMatch()
        this._currentMatch = []
        return this.isSuccessful()
    }

    canBacktrack(): boolean {
        return this._expressions[this._idx - 1].canBacktrack()
    }

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): MatchIteration {
        if (!this.hasNext()) {
            return matchFailed()
        }
        const nextExpression = this._expressions[this._idx]
        const res = nextExpression.matchNext(s, last, next);
        this._currentMatch = res.matched || nextExpression.isSuccessful() ? nextExpression.currentMatch() : []
        if (!nextExpression.hasNext()) {
            if (nextExpression.isSuccessful()) {
                this._persistedMatch = this.currentMatch()
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
                this._persistedMatch = []
                this._matchGroups = []
            }
            this._currentMatch = []
            this._idx++
        }
        return res
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
