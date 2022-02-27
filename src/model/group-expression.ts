import {Expression} from "./expression";

export class GroupExpression implements Expression {
    private readonly _expressions: Expression[]
    private _idx: number = 0
    private _persistedMatch: string[] = []
    private _currentMatch: string[] = []
    private _failed = false
    private _lastMatchConsumed = 0

    constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    hasNext(): boolean {
        return !this._failed && this._idx < this._expressions.length;
    }

    hasNotMatched(): boolean {
        return this._idx == 0;
    }

    isSuccessful(): boolean {
        return !this._failed && !!this.currentMatch().length && this._expressions.every(it => it.isSuccessful());
    }

    backtrack(): boolean {
        return false;
    }

    // TODO: Should be possible?
    canBacktrack(): boolean {
        return false;
    }

    lastMatchCharactersConsumed(): number {
        return this._lastMatchConsumed;
    }

    matchNext(s: string, last?: string, next?: string, isZeroPosMatch?: boolean): boolean {
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
            if (!nextExpression.isSuccessful()) {
                this._failed = true
                this._persistedMatch = []
            } else {
                this._persistedMatch = this.currentMatch()
            }
            this._currentMatch = []
            this._idx++
        }
        return res
    }

    currentMatch(): string[] {
        return [...this._persistedMatch, ...this._currentMatch];
    }

    tracksMatch(): boolean {
        return true;
    }

    reset(): void {
        this._idx = 0
        this._expressions.forEach(it => it.reset())
        this._currentMatch = []
        this._persistedMatch = []
        this._failed = false
    }
}
