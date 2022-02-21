import Token, {TokenType} from "../../model/token";
import {explode} from "../../utils/string-utils";

export default class Tokenizer {
    tokenize(s: string): Token[] {
        const chars = explode(s)
        return chars.map(it => {
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
            return Token.character(it)
        })
    }
}
