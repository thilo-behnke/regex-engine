import Tokenizer from "../engine/tokenizer/tokenizer";

export default class Token {
    private readonly _value: string
    private readonly _type: TokenType

    constructor(value: string, type: TokenType) {
        this._value = value;
        this._type = type;
    }

    static character(s: string): Token {
        return new Token(s, TokenType.CHARACTER)
    }

    static escaped(): Token {
        return new Token('\\', TokenType.ESCAPED)
    }

    static modifier(s: string): Token {
        return new Token(s, TokenType.MODIFIER)
    }

    static bracketOpen(): Token {
        return new Token('[', TokenType.BRACKET_OPEN)
    }

    static bracketClose(): Token {
        return new Token(']', TokenType.BRACKET_CLOSE)
    }

    static anchorStart(): Token {
        return new Token("^", TokenType.ANCHOR_START)
    }

    static anchorEnd(): Token {
        return new Token("$", TokenType.ANCHOR_END)
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
    ESCAPED = 'ESCAPED',
    MODIFIER = 'MODIFIER',
    BRACKET_OPEN = 'BRACKET_OPEN',
    BRACKET_CLOSE = 'BRACKET_CLOSE',
    ANCHOR_START = 'ANCHOR_START',
    ANCHOR_END = 'ANCHOR_END'
}
