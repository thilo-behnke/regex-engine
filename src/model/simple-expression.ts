import {Expression} from "./expression";
import Character from "./character";
import {IndexedToken} from "../utils/string-utils";
import {matchFailed, MatchIteration} from "./expression/match-iteration";

export class SimpleExpression implements Expression {
    private readonly _characters: Character[]

    private _idx = 0
    private _isSuccessful: boolean = undefined
    private _currentMatch: IndexedToken[] = []

    constructor(...characters: Character[]) {
        this._characters = characters;
    }

    isInitial(): boolean {
        return !this._currentMatch.length;
    }

    hasNext(): boolean {
        return this._idx < this._characters.length && this._isSuccessful != false
    }

    get minimumLength(): number {
        return this._characters.length;
    }

    isSuccessful(): boolean {
        if (this._characters.length == 0) {
            return true
        }
        return this._isSuccessful;
    }

    matchNext(s: IndexedToken, last: IndexedToken, next: IndexedToken, tokens: IndexedToken[], cursorPos: number): MatchIteration & {cursorOnly: boolean} {
        if (!this.hasNext()) {
            return {...matchFailed(), cursorOnly: false}
        }

        this._isSuccessful = this._characters[this._idx].test(s, last, next)
        // TODO: This does not create a full current match, only the match of the latest char is included.
        if (!this._characters[this._idx].cursorOnly() && this._isSuccessful && s) {
            this._currentMatch = [...this.currentMatch(), s]
        }
        const cursorOnly = this._characters[this._idx].cursorOnly()
        const consumed =  cursorOnly ? 0 : 1;
        this._idx++
        return this._isSuccessful ? {matched: true, consumed, cursorOnly} : {...matchFailed(), cursorOnly}
    }

    backtrack(): boolean {
        return false;
    }

    canBacktrack(): boolean {
        return false;
    }

    currentMatch(): IndexedToken[] {
        return this._currentMatch;
    }

    reset(): void {
        this._idx = 0
        this._isSuccessful = undefined
        this._currentMatch = []
    }
}
