
export interface RegexToken {
    get lexem(): string
    get type(): RegexTokenType
}

export default class DefaultRegexToken implements RegexToken {
    private readonly _lexem: string
    private readonly _type: RegexTokenType

    constructor(value: string, type: RegexTokenType) {
        this._lexem = value;
        this._type = type;
    }

    static character(s: string): DefaultRegexToken {
        return new DefaultRegexToken(s, RegexTokenType.CHARACTER)
    }

    static escaped(s: string): DefaultRegexToken {
        return new DefaultRegexToken(s, RegexTokenType.ESCAPED)
    }

    static modifier(s: string): DefaultRegexToken {
        return new DefaultRegexToken(s, RegexTokenType.MODIFIER)
    }

    static alternative(): DefaultRegexToken {
        return new DefaultRegexToken('|', RegexTokenType.ALTERNATIVE)
    }

    static groupStart(): DefaultRegexToken {
        return new DefaultRegexToken('(', RegexTokenType.GROUP_START)
    }

    static nonCapturingGroupStart(): DefaultRegexToken {
        return new DefaultRegexToken('(?:', RegexTokenType.NON_CAPTURING_GROUP_START)
    }

    static lookaheadGroupStart(negative: boolean = false): DefaultRegexToken {
        if (!negative) {
            return new DefaultRegexToken('(?=', RegexTokenType.LOOKAHEAD_GROUP_START)
        }
        return new DefaultRegexToken('(?!', RegexTokenType.LOOKAHEAD_NEGATIVE_GROUP_START)
    }

    static lookbehindGroupStart(negative: boolean = false): DefaultRegexToken {
        if (!negative) {
            return new DefaultRegexToken('(?<=', RegexTokenType.LOOKBEHIND_GROUP_START)
        }
        return new DefaultRegexToken('(?<!', RegexTokenType.LOOKBEHIND_NEGATIVE_GROUP_START)
    }

    static groupEnd(): DefaultRegexToken {
        return new DefaultRegexToken(')', RegexTokenType.GROUP_END)
    }

    static characterClassStart(negated: boolean = false): DefaultRegexToken {
        if (!negated) {
            return new DefaultRegexToken('[', RegexTokenType.CHARACTER_CLASS_START)
        }
        return new DefaultRegexToken('[^', RegexTokenType.CHARACTER_CLASS_NEGATED_START)
    }

    static characterClassEnd(): DefaultRegexToken {
        return new DefaultRegexToken(']', RegexTokenType.CHARACTER_CLASS_END)
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

    get lexem(): string {
        return this._lexem;
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
    GROUP_START = 'GROUP_START',
    NON_CAPTURING_GROUP_START = 'NON_CAPTURING_GROUP_START',
    LOOKBEHIND_GROUP_START = 'LOOKBEHIND_GROUP_START',
    LOOKBEHIND_NEGATIVE_GROUP_START = 'LOOKBEHIND_NEGATIVE_GROUP_START',
    LOOKAHEAD_GROUP_START = 'LOOKAHEAD_GROUP_START',
    LOOKAHEAD_NEGATIVE_GROUP_START = 'LOOKAHEAD_NEGATIVE_GROUP_START',
    GROUP_END = 'GROUP_END',
    CHARACTER_CLASS_START = 'CHARACTER_CLASS_START',
    CHARACTER_CLASS_NEGATED_START = 'CHARACTER_CLASS_NEGATED_START',
    CHARACTER_CLASS_END = 'CHARACTER_CLASS_END',
    ANCHOR_START = 'ANCHOR_START',
    ANCHOR_END = 'ANCHOR_END',
    EOF = 'EOF'
}
