import Token from "./token";

export default class Character {
    private readonly _value

    constructor(value: string) {
        this._value = value;
    }

    static fromTokens(...tokens: Token[]): Character[] {
        return tokens.map(it => new Character(it.value))
    }

    get value() {
        return this._value;
    }
}
