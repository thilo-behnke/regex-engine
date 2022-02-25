import Token from "./token";
import Character from "./character";
import {ExpressionDescriptor} from "../engine/parser/expression/expression-type";

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

    cursorOnly(): boolean {
        return false;
    }
}
