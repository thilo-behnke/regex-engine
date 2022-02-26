import Token, {TokenType} from "../../model/token";
import {explode} from "../../utils/string-utils";

export default class Tokenizer {
    tokenize(s: string): Token[] {
        const chars = explode(s)
        const tokens = chars.map(it => {
            if (it === '*' || it === '+') {
                return Token.modifier(it)
            }
            if (it == '\\') {
                return Token.escaped()
            }
            if (it === '[') {
                return Token.bracketOpen()
            }
            if (it == ']') {
                return Token.bracketClose()
            }
            if (it == '^') {
                return Token.anchorStart()
            }
            if (it == '$') {
                return Token.anchorEnd()
            }
            return Token.character(it)
        })
        return [
            ...tokens,
            Token.eof()
        ]
    }
}
