import {Expression} from "./expression";

export class GroupExpression implements Expression {
    private readonly _expressions: Expression[]
    private _idx: number = 0
    private _persistedMatch: string[] = []
    private _currentMatch: string[] = []
    private _failed = false
    private _lastMatchConsumed = 0

    private _nonCapturing: boolean = false

    constructor(...expressions: Expression[]) {
        this._expressions = expressions;
    }

    static nonCapturing(...expressions: Expression[]) {
        const expression = new GroupExpression(...expressions)
        expression._nonCapturing = true
        return expression
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
        if (!this.canBacktrack()) {
            return false
        }

        const updatedMatch = this._persistedMatch.slice(0, this._persistedMatch.length - 1)
        this.reset()
        updatedMatch.every(it => this.matchNext(it))
        this._failed = this._expressions.some(it => !it.isSuccessful())
        this._persistedMatch = this.currentMatch()
        this._currentMatch = []
        return this.isSuccessful()
    }

    canBacktrack(): boolean {
        return this._expressions[this._idx - 1].canBacktrack()
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
        return !this._nonCapturing;
    }

    reset(): void {
        this._idx = 0
        this._expressions.forEach(it => it.reset())
        this._currentMatch = []
        this._persistedMatch = []
        this._failed = false
    }
}
