import {Expression} from "./expression";
import FixedLengthExpression from "./fixed-length-expression";
import GroupExpression, {isGroupExpression} from "./group-expression";
import {MatchGroup} from "./match/match-group";
import {IndexedToken} from "../utils/string-utils";
import Parser from "../engine/parser/parser";

export abstract class AbstractGroupExpression implements Expression, GroupExpression {
    private _idx: number = 0
    private _persistedMatch: IndexedToken[] = []
    private _currentMatch: IndexedToken[] = []
    private _backtracked: IndexedToken[] = []
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

    abstract currentMatch(): IndexedToken[]

    get matchGroups(): Array<MatchGroup> {
        return this._matchGroups;
    }

    hasNext(): boolean {
        return !this._failed && (this._expressions[this._idx]?.hasNext() || this._expressions[this._idx + 1]?.hasNext());
    }

    isInitial(): boolean {
        return this._expressions.every(it => it.isInitial());
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
        this._backtracked = []

        let currentExpression = this._expressions[this._idx]
        while(currentExpression.canBacktrack()) {
            currentExpression = this._expressions[this._idx]
            const backtrackRes = currentExpression.backtrack()
            if (!backtrackRes) {
                return false
            }

            this._backtracked.push(this._persistedMatch[this._persistedMatch.length - 1])
            this._persistedMatch = this._persistedMatch.slice(1, this._persistedMatch.length - 1)
            // Shortcut
            this._failed = this._expressions.some(it => !it.isSuccessful())
            if (!this._failed) {
                return true
            }

            // Now try forward match
            while() {

            }

            if (currentExpression.isInitial() && currentExpression.isSuccessful()) {
                this._idx--
                continue
            }
        }

        // const updatedMatch = this._persistedMatch.slice(0, this._persistedMatch.length - 1)
        // this.reset()
        // let sIdx = 0
        // // TODO: Basically a regex engine within the group?
        // let hasMatched = true
        // while(hasMatched) {
        //     const thisChar = updatedMatch[sIdx]
        //     const last = sIdx > 0 ? updatedMatch[sIdx - 1] : null
        //     const next = sIdx < updatedMatch.length ? updatedMatch[sIdx + 1] : null
        //     hasMatched = this.matchNext(thisChar, last, next)
        //     sIdx++
        // }

        this._failed = this._expressions.some(it => !it.isSuccessful())
        this._persistedMatch = this.currentMatch()
        this._currentMatch = []
        return this.isSuccessful()
    }

    canBacktrack(): boolean {
        return this._expressions[this._idx].canBacktrack()
    }

    abstract lastMatchCharactersConsumed(): number

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): boolean {
        if (this._failed) {
            return false
        }

        if (!this._expressions[this._idx].hasNext() && this._expressions[this._idx + 1].hasNext()) {
            this._idx++
        }
        const nextExpression = this._expressions[this._idx]
        const res = nextExpression.matchNext(s, last, next);
        if (res) {
            this._lastMatchConsumed = nextExpression.lastMatchCharactersConsumed()
        }
        this._currentMatch = res || nextExpression.isSuccessful() ? nextExpression.currentMatch() : []
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
        }
        return res
    }

    reset(): void {
        this._idx = 0
        this._expressions.forEach(it => it.reset())
        this._currentMatch = []
        this._persistedMatch = []
        this._backtracked = []
        this._matchGroups = []
        this._failed = false
    }
}
