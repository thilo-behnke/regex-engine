import {Expression} from "./expression";
import Character from "./character";
import {IndexedToken} from "../utils/string-utils";

export class SimpleExpression implements Expression {
    private readonly _characters: Character[]

    private _idx = 0
    private _isSuccessful: boolean = undefined
    private _charactersConsumed = 0
    private _currentMatch: IndexedToken[] = []

    constructor(...characters: Character[]) {
        this._characters = characters;
    }

    isInitial(): boolean {
        return this._charactersConsumed === 0;
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

    matchNext(s: IndexedToken, last: IndexedToken = null, next: IndexedToken = null): boolean {
        if (!this.hasNext()) {
            return false
        }

        this._isSuccessful = this._characters[this._idx].test(s?.value, last?.value, next?.value, s?.first)
        // TODO: This does not create a full current match, only the match of the latest char is included.
        if (!this._characters[this._idx].cursorOnly() && this._isSuccessful && s) {
            this._currentMatch = [...this.currentMatch(), s]
        }
        this._charactersConsumed = this._characters[this._idx].cursorOnly() ? 0 : 1;
        this._idx++
        return this._isSuccessful
    }

    lastMatchCharactersConsumed(): number {
        return this._charactersConsumed;
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
