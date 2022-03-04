import {Expression} from "./expression";
import Token from "./token";
import Character from "./character";

export class SimpleExpression implements Expression {
    private readonly _characters: Character[]

    private _idx = 0
    private _isSuccessful: boolean = undefined
    private _charactersConsumed = 0
    private _currentMatch: string[] = []

    constructor(...characters: Character[]) {
        this._characters = characters;
    }

    hasNotMatched(): boolean {
        return this._charactersConsumed === 0;
    }

    hasNext(): boolean {
        return this._idx < this._characters.length && this._isSuccessful != false
    }

    isSuccessful(): boolean {
        if (this._characters.length == 0) {
            return true
        }
        return this._isSuccessful;
    }

    matchNext(s: string, last: string = null, next: string = null, isZeroPosMatch = false): boolean {
        if (!this.hasNext()) {
            return false
        }

        this._isSuccessful = this._characters[this._idx].test(s, last, next, isZeroPosMatch)
        this._currentMatch = this._isSuccessful ? [s] : []
        this._charactersConsumed = this._characters[this._idx].cursorOnly() ? 0 : 1;
        this._idx++
        return this._isSuccessful
    }

    lastMatchCharactersConsumed(): number {
        return this._charactersConsumed;
    }

    backtrack(isZeroPosMatch: boolean): boolean {
        return false;
    }

    canBacktrack(): boolean {
        return false;
    }

    currentMatch(): string[] {
        return this._currentMatch;
    }

    tracksMatch(): boolean {
        return false;
    }

    reset(): void {
        this._idx = 0
        this._isSuccessful = undefined
        this._currentMatch = []
    }
}
