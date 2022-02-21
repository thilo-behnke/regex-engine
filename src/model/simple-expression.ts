import {Expression} from "./expression";
import Token from "./token";
import Character from "./character";

export class SimpleExpression implements Expression {
    private readonly _characters: Character[]

    private _idx = 0
    private _isSuccessful: boolean = undefined

    constructor(...characters: Character[]) {
        this._characters = characters;
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

    matchNext(s: string): boolean {
        if (!this.hasNext()) {
            return false
        }

        this._isSuccessful = s === this._characters[this._idx].value
        this._idx++
        return this._isSuccessful
    }

    reset(): void {
        this._idx = 0
        this._isSuccessful = undefined
    }
}
