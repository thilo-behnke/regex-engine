import Character from "./character";

export default class DefaultCharacter implements Character {
    private readonly _value

    constructor(value: string) {
        this._value = value;
    }

    test(s: string): boolean {
        return this._value == s
    }

    cursorOnly(): boolean {
        return false;
    }
}
