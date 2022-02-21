import Tokenizer from "../engine/tokenizer/tokenizer";

export default class Token {
    private readonly _value: string
    private readonly _type: TokenType

    constructor(value: string, type: TokenType) {
        this._value = value;
        this._type = type;
    }

    static Character(s: string): Token {
        return new Token(s, TokenType.CHARACTER)
    }

    static Modifier(s: string): Token {
        return new Token(s, TokenType.MODIFIER)
    }

    get value(): string {
        return this._value;
    }

    get type(): TokenType {
        return this._type;
    }
}

export enum TokenType {
    CHARACTER = 'CHARACTER',
    MODIFIER = 'MODIFIER'
}
