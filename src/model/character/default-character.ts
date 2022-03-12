import Character from "./character";
import {IndexedToken} from "@utils/string-utils";

export default class DefaultCharacter implements Character {
    private readonly _value

    constructor(value: string) {
        this._value = value;
    }

    test(s: IndexedToken): boolean {
        return this._value == s?.value
    }

    cursorOnly(): boolean {
        return false;
    }
}
