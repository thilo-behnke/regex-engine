
export interface RegexToken {
    get value(): string
    get type(): RegexTokenType
}

export default class DefaultRegexToken implements RegexToken {
    private readonly _value: string
    private readonly _type: RegexTokenType

    constructor(value: string, type: RegexTokenType) {
        this._value = value;
        this._type = type;
    }

    static character(s: string): DefaultRegexToken {
        return new DefaultRegexToken(s, RegexTokenType.CHARACTER)
    }

    static escaped(): DefaultRegexToken {
        return new DefaultRegexToken('\\', RegexTokenType.ESCAPED)
    }

    static modifier(s: string): DefaultRegexToken {
        return new DefaultRegexToken(s, RegexTokenType.MODIFIER)
    }

    static bracketOpen(): DefaultRegexToken {
        return new DefaultRegexToken('(', RegexTokenType.BRACKET_OPEN)
    }

    static bracketClose(): DefaultRegexToken {
        return new DefaultRegexToken(')', RegexTokenType.BRACKET_CLOSE)
    }

    static squareBracketOpen(): DefaultRegexToken {
        return new DefaultRegexToken('[', RegexTokenType.SQUARE_BRACKET_OPEN)
    }

    static squareBracketClose(): DefaultRegexToken {
        return new DefaultRegexToken(']', RegexTokenType.SQUARE_BRACKET_CLOSE)
    }

    static anchorStart(): DefaultRegexToken {
        return new DefaultRegexToken("^", RegexTokenType.ANCHOR_START)
    }

    static anchorEnd(): DefaultRegexToken {
        return new DefaultRegexToken("$", RegexTokenType.ANCHOR_END)
    }

    static eof(): DefaultRegexToken {
        return new DefaultRegexToken("EOF", RegexTokenType.EOF)
    }

    get value(): string {
        return this._value;
    }

    get type(): RegexTokenType {
        return this._type;
    }
}

export enum RegexTokenType {
    CHARACTER = 'CHARACTER',
    ESCAPED = 'ESCAPED',
    MODIFIER = 'MODIFIER',
    ALTERNATIVE = 'ALTERNATIVE',
    BRACKET_OPEN = 'BRACKET_OPEN',
    BRACKET_CLOSE = 'BRACKET_CLOSE',
    SQUARE_BRACKET_OPEN = 'SQUARE_BRACKET_OPEN',
    SQUARE_BRACKET_CLOSE = 'SQUARE_BRACKET_CLOSE',
    ANCHOR_START = 'ANCHOR_START',
    ANCHOR_END = 'ANCHOR_END',
    EOF = 'EOF'
}
