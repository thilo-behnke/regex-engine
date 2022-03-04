import {explode} from "../../utils/string-utils";
import DefaultRegexToken from "../../model/token/regex-token";

export default class Tokenizer {
    tokenize(s: string): DefaultRegexToken[] {
        const chars = explode(s)
        const tokens = chars.map((it, idx) => {
            if (it === '*' || it === '+') {
                return DefaultRegexToken.modifier(it)
            }
            if (it == '\\') {
                return DefaultRegexToken.escaped()
            }
            if (it === '(') {
                return DefaultRegexToken.bracketOpen()
            }
            if (it == ')') {
                return DefaultRegexToken.bracketClose()
            }
            if (it === '[') {
                return DefaultRegexToken.squareBracketOpen()
            }
            if (it == ']') {
                return DefaultRegexToken.squareBracketClose()
            }
            if (it == '^' && idx === 0) {
                return DefaultRegexToken.anchorStart()
            }
            if (it == '^') {
                return DefaultRegexToken.character('^')
            }
            if (it == '$') {
                return DefaultRegexToken.anchorEnd()
            }
            return DefaultRegexToken.character(it)
        })
        return [
            ...tokens,
            DefaultRegexToken.eof()
        ]
    }
}
