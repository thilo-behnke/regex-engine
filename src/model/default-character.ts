import Token from "./token";
import Character from "./character";

export default class DefaultCharacter implements Character {
    private readonly _value

    constructor(value: string) {
        this._value = value;
    }

    static fromTokens(...tokens: Token[]): Character[] {
        return tokens.map(it => new DefaultCharacter(it.value))
    }

    test(s: string): boolean {
        return this._value == s
    }
}
