import {Expression} from "./expression";
import FixedLengthExpression from "./fixed-length-expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "./match/match-group";

export abstract class AbstractGroupExpression implements Expression, GroupExpression {
    private _idx: number = 0
    private _persistedMatch: string[] = []
    private _currentMatch: string[] = []
    private _matchGroups: MatchGroup[] = []

    protected readonly _expressions: Expression[]
    protected _failed = false
    protected _lastMatchConsumed = 0

    protected constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    protected get internalMatch() {
        return [...this._persistedMatch, ...this._currentMatch];
    }

    abstract currentMatch(): string[]

    get matchGroups(): Array<MatchGroup> {
        return this._matchGroups;
    }

    hasNext(): boolean {
        return !this._failed && this._idx < this._expressions.length && this._expressions[this._idx].hasNext();
    }

    hasNotMatched(): boolean {
        return this._idx == 0;
    }

    get minimumLength(): number {
        return this._expressions.reduce((acc, it) => acc + it.minimumLength, 0);
    }

    abstract isSuccessful(): boolean

    abstract tracksMatch(): boolean

    backtrack(isZeroPosMatch: boolean): boolean {
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
            hasMatched = this.matchNext(thisChar, last, next, isZeroPosMatch)
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

    abstract lastMatchCharactersConsumed(): number

    matchNext(s: string, last: string = null, next: string = null, isZeroPosMatch: boolean = null): boolean {
        if (!this.hasNext()) {
            return false
        }
        const nextExpression = this._expressions[this._idx]
        const res = nextExpression.matchNext(s, last, next, isZeroPosMatch);
        if (res) {
            this._lastMatchConsumed = nextExpression.lastMatchCharactersConsumed()
        }
        this._currentMatch = res || nextExpression.isSuccessful() ? nextExpression.currentMatch() : []
        if (!nextExpression.hasNext()) {
            if (nextExpression.isSuccessful()) {
                const expressionMatchFrom = this._persistedMatch.length
                this._persistedMatch = this.currentMatch()
                this._matchGroups = []
                if (this.tracksMatch()) {
                    this._matchGroups = [{match: this._persistedMatch.join(''), from: 0, to: this._persistedMatch.length}]
                }
                if (isGroupExpression(nextExpression)) {
                    this._matchGroups = [...this.matchGroups, ...nextExpression.matchGroups.map(group => ({match: group.match, from: expressionMatchFrom + group.from, to: expressionMatchFrom + group.to}))]
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
